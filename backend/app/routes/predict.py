from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.orm_models import AnalysisHistory
from app.schemas.schemas import EstimatedRange, PredictRequest, PredictResponse
from app.services.model_service import model_service

router = APIRouter()

SUPPORTED_CITIES = {
    "Mumbai", "Nagpur", "Delhi", "Bengaluru", "Pune", "Jaipur", "Goa",
}


@router.post("/predict", response_model=PredictResponse)
def predict_price(payload: PredictRequest, db: Session = Depends(get_db)):
    if not model_service.is_ready:
        raise HTTPException(status_code=503, detail="ML model is currently unavailable. Please try again shortly.")

    if payload.city not in SUPPORTED_CITIES:
        raise HTTPException(
            status_code=422,
            detail=f"'{payload.city}' is not yet supported. Supported cities: {sorted(SUPPORTED_CITIES)}",
        )

    try:
        result = model_service.predict(
            city=payload.city,
            service_type=payload.service_type,
            distance_km=payload.distance_km,
            hour=payload.time.hour,
            day_of_week=payload.date.weekday(),
            month=payload.date.month,
            vehicle_type=payload.vehicle_type,
            quoted_price=payload.quoted_price,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed due to an internal error. Please try again.")

    if result["n_observations"] < 3:
        # Extremely sparse coverage — be explicit rather than silently guessing
        result["low_data_notice"] = (
            "Not enough comparable data is available for this city/service combination. "
            "Please treat this estimate with caution."
        )
    else:
        result["low_data_notice"] = None

    # Log every served prediction for audit / future confidence tuning
    try:
        history = AnalysisHistory(
            city=payload.city,
            service_type=payload.service_type,
            distance_km=payload.distance_km,
            quoted_price=payload.quoted_price,
            predicted_price=result["predicted_price"],
            range_min=result["range_min"],
            range_max=result["range_max"],
            status=result["status"],
            confidence=result["confidence"],
        )
        db.add(history)
        db.commit()
    except Exception:
        db.rollback()  # Never fail the prediction response just because logging failed

    return PredictResponse(
        city=payload.city,
        service_type=payload.service_type,
        distance_km=payload.distance_km,
        quoted_price=payload.quoted_price,
        predicted_price=result["predicted_price"],
        estimated_range=EstimatedRange(min=result["range_min"], max=result["range_max"]),
        status=result["status"],
        confidence=result["confidence"],
        explanation=result["explanation"],
        disclaimer=result["disclaimer"],
        dataset_notice=result["dataset_notice"],
        low_data_notice=result["low_data_notice"],
    )
