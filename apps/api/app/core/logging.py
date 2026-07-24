import logging
import sys
from typing import Any


class JsonLikeFormatter(logging.Formatter):
    """Lightweight structured-ish formatter suitable for Render logs."""

    def format(self, record: logging.LogRecord) -> str:
        base = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        extras = {
            key: value
            for key, value in record.__dict__.items()
            if key
            not in {
                "name",
                "msg",
                "args",
                "levelname",
                "levelno",
                "pathname",
                "filename",
                "module",
                "exc_info",
                "exc_text",
                "stack_info",
                "lineno",
                "funcName",
                "created",
                "msecs",
                "relativeCreated",
                "thread",
                "threadName",
                "processName",
                "process",
                "message",
                "taskName",
            }
            and not key.startswith("_")
        }
        if extras:
            base["extra"] = extras
        if record.exc_info:
            base["exception"] = self.formatException(record.exc_info)
        parts = [f"{k}={v!r}" for k, v in base.items()]
        return " ".join(parts)


def configure_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    if root.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLikeFormatter())
    root.addHandler(handler)
    root.setLevel(level)

    # Quiet noisy loggers in development
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
