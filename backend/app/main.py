import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import community, meta, ocr, predict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fairtrip")

app = FastAPI(
    title="FairTrip API",
    description="AI-Powered Fair Price Intelligence for Travelers — decision-support only.",
    version="0.1.0",
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


@app.get("/")
def root():
    return {"name": "FairTrip API", "status": "running", "docs": "/docs"}
