from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import relationship

from app.database.db import Base


class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    state = Column(String(100))
    country = Column(String(100), default="India")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    display_name = Column(String(100))
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class PriceReport(Base):
    __tablename__ = "price_reports"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    city = Column(String(100), nullable=False)
    service_type = Column(String(50), nullable=False)
    distance_km = Column(Numeric(6, 2), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    trip_date = Column(Date, nullable=False)
    trip_time = Column(Time, nullable=False)
    vehicle_type = Column(String(50))
    notes = Column(Text)
    evidence_url = Column(Text)
    status = Column(String(20), nullable=False, default="PENDING")
    rejection_reason = Column(Text)
    validated_by = Column(Integer, ForeignKey("users.id"))
    validated_at = Column(DateTime(timezone=False))
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class ValidatedPrice(Base):
    __tablename__ = "validated_prices"
    id = Column(Integer, primary_key=True)
    price_report_id = Column(Integer, ForeignKey("price_reports.id"), unique=True)
    city = Column(String(100), nullable=False)
    service_type = Column(String(50), nullable=False)
    distance_km = Column(Numeric(6, 2), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    hour = Column(SmallInteger, nullable=False)
    day_of_week = Column(SmallInteger, nullable=False)
    month = Column(SmallInteger, nullable=False)
    vehicle_type = Column(String(50))
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    city = Column(String(100), nullable=False)
    service_type = Column(String(50), nullable=False)
    distance_km = Column(Numeric(6, 2), nullable=False)
    quoted_price = Column(Numeric(10, 2), nullable=False)
    predicted_price = Column(Numeric(10, 2), nullable=False)
    range_min = Column(Numeric(10, 2), nullable=False)
    range_max = Column(Numeric(10, 2), nullable=False)
    status = Column(String(30), nullable=False)
    confidence = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class OcrRecord(Base):
    __tablename__ = "ocr_records"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(Text)
    raw_text = Column(Text)
    extracted_service = Column(String(50))
    extracted_price = Column(Numeric(10, 2))
    confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
