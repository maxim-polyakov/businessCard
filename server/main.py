import os
import re
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from canban import CanbanIntegrationError, create_canban_quest
from database import ContactSubmission, get_session, init_db
from logging_config import setup_logging
from storage import upload_bytes_to_s3


setup_logging()
logger = logging.getLogger(__name__)

MAX_UPLOAD_SIZE = 10 * 1024 * 1024
ALLOWED_FILE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".pdf", ".doc", ".docx", ".txt"}


def get_cors_origins() -> list[str]:
    default_origins = "https://baxic.ru,https://www.baxic.ru"
    raw_origins = os.getenv("CORS_ORIGINS", default_origins)
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app = FastAPI(
    title="Business Card API",
    description="Backend for contact requests from the personal business-card website.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_http_requests(request: Request, call_next):
    logger.info("HTTP request started: method=%s path=%s", request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("HTTP request failed: method=%s path=%s", request.method, request.url.path)
        raise

    logger.info(
        "HTTP request completed: method=%s path=%s status_code=%s",
        request.method,
        request.url.path,
        response.status_code,
    )
    return response


@app.on_event("startup")
async def startup() -> None:
    await init_db()
    logger.info("Server started and database initialized")


class HealthResponse(BaseModel):
    status: str


class ContactResponse(BaseModel):
    ok: bool
    request_id: str
    message: str


def sanitize_filename(filename: str) -> str:
    safe_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", Path(filename).name)
    return safe_name or "attachment"


async def upload_attachment(file: UploadFile | None, request_id: str) -> dict[str, Any] | None:
    if file is None or not file.filename:
        logger.info("Contact request has no attachment: request_id=%s", request_id)
        return None

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File is too large")

    safe_name = sanitize_filename(file.filename)
    content_type = file.content_type or "application/octet-stream"
    s3_key = f"contact-attachments/{request_id}/{safe_name}"
    logger.info(
        "Uploading contact attachment to S3: request_id=%s filename=%s size=%s",
        request_id,
        safe_name,
        len(content),
    )

    try:
        attachment_url = await upload_bytes_to_s3(content, s3_key, content_type)
    except RuntimeError as error:
        logger.exception("S3 configuration error for request_id=%s", request_id)
        raise HTTPException(status_code=500, detail=str(error)) from error

    return {
        "original_name": file.filename,
        "stored_name": safe_name,
        "content_type": content_type,
        "size": len(content),
        "s3_key": s3_key,
        "url": attachment_url,
        "content": content,
    }


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/api/contact", response_model=ContactResponse)
async def create_contact_request(
    name: Annotated[str, Form(min_length=2, max_length=120)],
    email: Annotated[EmailStr, Form()],
    message: Annotated[str, Form(min_length=5, max_length=4000)],
    company: Annotated[str | None, Form(max_length=160)] = None,
    phone: Annotated[str | None, Form(max_length=40)] = None,
    consent: Annotated[bool, Form()] = False,
    attachment: UploadFile | None = File(default=None),
    session: AsyncSession = Depends(get_session),
) -> ContactResponse:
    if not consent:
        raise HTTPException(status_code=400, detail="Personal data consent is required")

    request_id = uuid.uuid4().hex
    logger.info(
        "Contact request received: request_id=%s email=%s company=%s has_attachment=%s",
        request_id,
        email,
        company or "-",
        bool(attachment and attachment.filename),
    )
    uploaded_file = await upload_attachment(attachment, request_id)

    submission = ContactSubmission(
        request_id=request_id,
        created_at=datetime.now(timezone.utc),
        name=name,
        company=company,
        email=str(email),
        phone=phone,
        message=message,
        consent=consent,
        attachment_original_name=uploaded_file["original_name"] if uploaded_file else None,
        attachment_stored_name=uploaded_file["stored_name"] if uploaded_file else None,
        attachment_content_type=uploaded_file["content_type"] if uploaded_file else None,
        attachment_size=uploaded_file["size"] if uploaded_file else None,
        attachment_s3_key=uploaded_file["s3_key"] if uploaded_file else None,
        attachment_url=uploaded_file["url"] if uploaded_file else None,
    )
    try:
        session.add(submission)
        await session.commit()
        logger.info("Contact request saved to database: request_id=%s", request_id)
    except Exception as error:
        await session.rollback()
        logger.exception("Failed to save contact request: request_id=%s", request_id)
        raise HTTPException(status_code=500, detail="Failed to save contact request") from error

    try:
        canban_quest_id = await create_canban_quest(
            name=name,
            company=company,
            email=str(email),
            phone=phone,
            message=message,
            attachment=uploaded_file,
        )
        submission.canban_quest_id = canban_quest_id
        submission.canban_sync_error = None
        await session.commit()
        logger.info(
            "Canban quest created: request_id=%s quest_id=%s has_attachment=%s",
            request_id,
            canban_quest_id,
            uploaded_file is not None,
        )
    except CanbanIntegrationError as error:
        submission.canban_sync_error = str(error)[:1000]
        await session.commit()
        logger.exception("Failed to sync contact request with Canban: request_id=%s", request_id)
        raise HTTPException(status_code=502, detail="Failed to create Canban task") from error

    logger.info(
        "Contact request saved: request_id=%s has_attachment=%s",
        request_id,
        uploaded_file is not None,
    )

    return ContactResponse(
        ok=True,
        request_id=request_id,
        message="Contact request has been saved",
    )
