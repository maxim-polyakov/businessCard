import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from dotenv import load_dotenv


APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")

DEFAULT_LOG_FILE = APP_DIR / "logs" / "server.log"


def setup_logging() -> None:
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_file = Path(os.getenv("LOG_FILE", str(DEFAULT_LOG_FILE)))
    log_file.parent.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        handlers=[file_handler, stream_handler],
        force=True,
    )
