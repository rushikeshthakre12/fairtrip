
import io
import re

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
import pytesseract

from app.schemas.schemas import OcrResponse

# Explicit Windows Tesseract installation path
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

router = APIRouter()

PRICE_PATTERN = re.compile(
    r"(?:₹|rs\.?|inr)\s*([0-9]{2,6}(?:[.,][0-9]{1,2})?)",
    re.IGNORECASE,
)

SERVICE_KEYWORDS = {
    "taxi": "Taxi",
    "cab": "Taxi",
    "auto": "Auto",
    "rickshaw": "Auto",
}


@router.post("/ocr", response_model=OcrResponse)
async def scan_and_check(file: UploadFile = File(...)):
    if file.content_type not in (
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ):
        raise HTTPException(
            status_code=422,
            detail="Please upload a PNG, JPG, or WEBP image.",
        )

    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=422,
            detail="That file isn't a valid image. Please try another photo.",
        )

    try:
        raw_text = pytesseract.image_to_string(image)
    except pytesseract.pytesseract.TesseractNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Tesseract was not found. Check the configured executable path.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not process this image. ({type(e).__name__})",
        )

    extracted_price = None
    price_match = PRICE_PATTERN.search(raw_text)

    if price_match:
        price_text = price_match.group(1).replace(",", ".")
        extracted_price = float(price_text)

    extracted_service = None
    lowered = raw_text.lower()

    for keyword, service_name in SERVICE_KEYWORDS.items():
        if keyword in lowered:
            extracted_service = service_name
            break

    return OcrResponse(
        raw_text=raw_text.strip(),
        extracted_service=extracted_service,
        extracted_price=extracted_price,
        verification_notice=(
            "Please verify the extracted information before analysis."
        ),
    )
