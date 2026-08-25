import os
import logging
from pathlib import Path

import aioboto3
from dotenv import load_dotenv


APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")


def get_env(name: str) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else None


S3_ENDPOINT_URL = get_env("S3_ENDPOINT_URL")
S3_ACCESS_KEY_ID = get_env("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = get_env("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = get_env("S3_BUCKET_NAME")
S3_REGION = get_env("S3_REGION")
S3_PUBLIC_URL_BASE = get_env("S3_PUBLIC_URL_BASE")
logger = logging.getLogger(__name__)


def require_s3_bucket() -> str:
    if not S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is not configured")
    return S3_BUCKET_NAME


def build_public_url(key: str) -> str | None:
    if S3_PUBLIC_URL_BASE:
        return f"{S3_PUBLIC_URL_BASE.rstrip('/')}/{key}"

    if S3_ENDPOINT_URL and S3_BUCKET_NAME:
        return f"{S3_ENDPOINT_URL.rstrip('/')}/{S3_BUCKET_NAME}/{key}"

    if S3_BUCKET_NAME and S3_REGION:
        return f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{key}"

    return None


async def upload_bytes_to_s3(content: bytes, key: str, content_type: str) -> str | None:
    bucket = require_s3_bucket()
    session = aioboto3.Session()

    async with session.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        region_name=S3_REGION,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
    ) as client:
        await client.put_object(
            Bucket=bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )

    logger.info("Uploaded attachment to S3: bucket=%s key=%s", bucket, key)
    return build_public_url(key)
