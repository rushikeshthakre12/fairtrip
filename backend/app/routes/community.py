from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.orm_models import PriceReport, ValidatedPrice
from app.schemas.schemas import CommunityReportCreate, CommunityReportResponse

router = APIRouter()


@router.post("/community-reports", response_model=CommunityReportResponse, status_code=201)
def submit_report(payload: CommunityReportCreate, db: Session = Depends(get_db)):
    # Flag obviously suspicious values rather than blindly accepting
    if payload.price / max(payload.distance_km, 0.1) > 2000:
        raise HTTPException(
            status_code=422,
            detail="This price-per-km ratio looks unusually high for a report submission. "
            "Please double check the values before submitting.",
        )

    report = PriceReport(
        city=payload.city.strip().title(),
        service_type=payload.service_type,
        distance_km=payload.distance_km,
        price=payload.price,
        trip_date=payload.trip_date,
        trip_time=payload.trip_time,
        vehicle_type=payload.vehicle_type,
        notes=payload.notes,
        evidence_url=payload.evidence_url,
        status="PENDING",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return CommunityReportResponse(
        id=report.id,
        city=report.city,
        service_type=report.service_type,
        distance_km=float(report.distance_km),
        price=float(report.price),
        status=report.status,
        created_at=report.created_at.isoformat(),
    )


@router.get("/community-reports")
def list_reports(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(PriceReport)
    if status:
        query = query.filter(PriceReport.status == status.upper())
    reports = query.order_by(PriceReport.created_at.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "city": r.city,
            "service_type": r.service_type,
            "distance_km": float(r.distance_km),
            "price": float(r.price),
            "trip_date": str(r.trip_date),
            "trip_time": str(r.trip_time),
            "vehicle_type": r.vehicle_type,
            "notes": r.notes,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.post("/community-reports/{report_id}/validate")
def validate_report(report_id: int, decision: str, db: Session = Depends(get_db)):
    """Simple admin/validation workflow for the prototype.
    decision: 'VALIDATED' or 'REJECTED'
    """
    if decision not in ("VALIDATED", "REJECTED"):
        raise HTTPException(status_code=422, detail="decision must be VALIDATED or REJECTED")

    report = db.query(PriceReport).filter(PriceReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = decision
    db.commit()

    if decision == "VALIDATED":
        # Only VALIDATED reports become eligible training data
        existing = db.query(ValidatedPrice).filter(ValidatedPrice.price_report_id == report.id).first()
        if not existing:
            vp = ValidatedPrice(
                price_report_id=report.id,
                city=report.city,
                service_type=report.service_type,
                distance_km=report.distance_km,
                price=report.price,
                hour=report.trip_time.hour,
                day_of_week=report.trip_date.weekday(),
                month=report.trip_date.month,
                vehicle_type=report.vehicle_type,
            )
            db.add(vp)
            db.commit()

    return {"id": report.id, "status": report.status}
