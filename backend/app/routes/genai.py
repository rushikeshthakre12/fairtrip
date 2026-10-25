from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services import cbow_service, explain_service

router = APIRouter()


@router.get("/genai/next-words")
def next_words(text: str = Query("", max_length=500)):
    if not cbow_service.is_ready():
        raise HTTPException(status_code=503, detail="Next-word model not trained yet. Run ml/training/train_cbow.py.")
    return {
        "suggestions": cbow_service.next_words(text, k=3),
        "model": "CBOW (NumPy), trained on a taxi/travel note corpus",
    }


class ExplainRequest(BaseModel):
    city: str = Field(..., min_length=2, max_length=100)
    service_type: str = Field(..., max_length=20)
    distance_km: float = Field(..., gt=0, le=500)
    quoted_price: float = Field(..., gt=0, le=200000)
    predicted_price: float = Field(..., gt=0)
    range_min: float = Field(..., ge=0)
    range_max: float = Field(..., gt=0)
    status: str = Field(..., pattern="^(TYPICAL|ABOVE_TYPICAL|UNUSUALLY_HIGH)$")
    top_factors: list[str] = Field(default_factory=list, max_length=3)


@router.post("/genai/explain")
def explain(payload: ExplainRequest):
    return explain_service.explain(payload.model_dump())
