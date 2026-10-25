import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.db import SessionLocal
from app.models.orm_models import City, Service
from app.routes import community, genai, meta, ocr, predict
from app.services.city_meta import CITY_STATES
from app.services.model_service import model_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fairtrip")

def seed_reference_data():
    """Idempotent: makes sure every city the model knows (and each service) exists in the DB."""
    db = SessionLocal()
    try:
        have = {c.name for c in db.query(City).all()}
        for name in model_service.supported_cities():
            if name not in have:
                db.add(City(name=name, state=CITY_STATES.get(name)))
        have_s = {s.name for s in db.query(Service).all()}
        for name in ("Taxi", "Auto"):
            if name not in have_s:
                db.add(Service(name=name))
        db.commit()
    except Exception:
        db.rollback()
        logger.warning("Could not seed reference data (is the database up?)")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_reference_data()
    yield


app = FastAPI(
    title="FairTrip API",
    description="AI-Powered Fair Price Intelligence for Travelers — decision-support only.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces to clients
    logger.exception("Unhandled error on %s", request.url)
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred. Please try again."})


app.include_router(meta.router, prefix="/api", tags=["meta"])
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(community.router, prefix="/api", tags=["community"])
app.include_router(ocr.router, prefix="/api", tags=["ocr"])
app.include_router(genai.router, prefix="/api", tags=["genai"])


@app.get("/")
def root():
    return {"name": "FairTrip API", "status": "running", "docs": "/docs"}
