import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import BigInteger, Boolean, DateTime, String, Text
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(AsyncAttrs, DeclarativeBase):
    pass


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    message: Mapped[str] = mapped_column(Text)
    consent: Mapped[bool] = mapped_column(Boolean, default=True)
    attachment_original_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_stored_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_content_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    attachment_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    attachment_s3_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    attachment_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
