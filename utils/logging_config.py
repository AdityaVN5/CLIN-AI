"""Privacy-conscious logging. Medical content and credentials are never logged."""
import logging, time
def configure_logging() -> logging.Logger:
    logger = logging.getLogger("clinical_app")
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
logger = configure_logging()
def log_event(agent: str, action: str, status: str, duration: float | None = None) -> None:
    suffix = f" duration={duration:.2f}s" if duration is not None else ""
    logger.info("agent=%s action=%s status=%s%s", agent, action, status, suffix)
