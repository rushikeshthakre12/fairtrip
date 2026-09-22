from datetime import date, time
from typing import Optional

from pydantic import BaseModel, Field, field_validator

SUPPORTED_SERVICES = {"Taxi", "Auto"}


# ---------- /api/predict ----------

class PredictRequest(BaseModel):
    city: str = Field(..., min_length=2, max_length=100)
    service_type: str = Field(..., description="Taxi or Auto")
    distance_km: float = Field(..., gt=0, le=500)
    date: date
    time: time
    quoted_price: float = Field(..., gt=0, le=200000)
    vehicle_type: Optional[str] = None
    pickup_location: Optional[str] = None
    destination: Optional[str] = None

    @field_validator("service_type")
    @classmethod
    def validate_service(cls, v):
        if v not in SUPPORTED_SERVICES:
            raise ValueError(
                f"Unsupported service '{v}'. Currently supported: {sorted(SUPPORTED_SERVICES)}"
            )
        return v

    @field_validator("city")
    @classmethod
    def sanitize_city(cls, v):
        return v.strip().title()


class ExplanationFactor(BaseModel):
    factor: str
    value: str
    note: str
    importance: float


class EstimatedRange(BaseModel):
    min: float
    max: float


class PredictResponse(BaseModel):
    city: str
    service_type: str
    distance_km: float
    quoted_price: float
    predicted_price: float
    estimated_range: EstimatedRange
    status: str
    confidence: str
    explanation: list[ExplanationFactor]
    disclaimer: str
    dataset_notice: str
    low_data_notice: Optional[str] = None


# ---------- /api/community-reports ----------

class CommunityReportCreate(BaseModel):
    city: str = Field(..., min_length=2, max_length=100)
    service_type: str
    distance_km: float = Field(..., gt=0, le=500)
    price: float = Field(..., gt=0, le=200000)
    trip_date: date
    trip_time: time
    vehicle_type: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)
    evidence_url: Optional[str] = None

    @field_validator("service_type")
    @classmethod
    def validate_service(cls, v):
        if v not in SUPPORTED_SERVICES:
            raise ValueError(f"Unsupported service '{v}'.")
        return v


class CommunityReportResponse(BaseModel):
    id: int
    city: str
    service_type: str
    distance_km: float
    price: float
    status: str
    created_at: str


# ---------- /api/ocr ----------

class OcrResponse(BaseModel):
    raw_text: str
    extracted_service: Optional[str]
    extracted_price: Optional[float]
    verification_notice: str
