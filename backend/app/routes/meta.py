from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.orm_models import City, Service
from app.services.model_service import model_service

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return {
        "status": "ok" if (db_ok and model_service.is_ready) else "degraded",
        "database": "connected" if db_ok else "unavailable",
        "ml_model": "loaded" if model_service.is_ready else "unavailable",
    }


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).filter(City.is_active.is_(True)).order_by(City.name).all()
    return [{"id": c.id, "name": c.name, "state": c.state} for c in cities]


@router.get("/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).filter(Service.is_active.is_(True)).order_by(Service.name).all()
    return [{"id": s.id, "name": s.name} for s in services]


@router.get("/model-info")
def model_info():
    """Transparency page data source — real metrics only, never invented."""
    if not model_service.is_ready:
        raise HTTPException(status_code=503, detail="Model metrics unavailable.")
    return model_service.metrics
