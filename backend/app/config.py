import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR.parent / ".env")


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://fairtrip:fairtrip_dev_pw@localhost:5432/fairtrip"
    )
    CORS_ORIGINS: list[str] = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173").split(",")
    MODEL_PATH: str = str(BACKEND_DIR.parent / "ml" / "models" / "fairtrip_model.pkl")
    METRICS_PATH: str = str(BACKEND_DIR.parent / "ml" / "models" / "metrics.json")
    CBOW_PATH: str = str(BACKEND_DIR.parent / "ml" / "models" / "cbow.npz")
    CBOW_METRICS_PATH: str = str(BACKEND_DIR.parent / "ml" / "models" / "cbow_metrics.json")
    # Optional. Without a key, the AI Trip Assistant uses its offline template.
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    ENV: str = os.getenv("ENV", "development")


settings = Settings()
