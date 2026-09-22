
import io
import os
import re

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
import pytesseract

from app.schemas.schemas import OcrResponse


router = APIRouter()


# Windows Tesseract configuration
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )


# Detect prices such as:
# ₹900
# Rs 900
# Rs. 900
# INR 900
PRICE_PATTERN = re.compile(
    r"(?:₹|rs\.?|inr)\s?([0-9]{2,6}(?:[.,][0-9]{1,2})?)",
    re.IGNORECASE,
)


# Detect transportation service
SERVICE_KEYWORDS = {
    "taxi": "Taxi",
    "cab": "Taxi",
    "auto": "Auto",
    "rickshaw": "Auto",
}


@router.post("/ocr", response_model=OcrResponse)
async def scan_and_check(file: UploadFile = File(...)):

    # Validate uploaded file type
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

    # Read uploaded file
    contents = await file.read()

    # Open image
    try:
        image = Image.open(io.BytesIO(contents))
        image.load()

    except UnidentifiedImageError:
        raise HTTPException(
            status_code=422,
            detail=(
                "That file doesn't look like a valid image. "
                "Please try a different photo."
            ),
        )

    # Run OCR using Tesseract
    try:
        raw_text = pytesseract.image_to_string(image)

    except pytesseract.pytesseract.TesseractNotFoundError:
        raise HTTPException(
            status_code=503,
            detail=(
                "OCR engine (Tesseract) is not installed or not available. "
                "Please install Tesseract OCR and restart the backend."
            ),
        )

    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not process this image. "
                f"Please try a clearer photo. ({type(e).__name__})"
            ),
        )

    # ---------------------------------------
    # Extract quoted price
    # ---------------------------------------

    extracted_price = None

    price_match = PRICE_PATTERN.search(raw_text)

    if price_match:
        price_value = price_match.group(1)

        # Remove commas from values such as 1,200
        price_value = price_value.replace(",", "")

        try:
            extracted_price = float(price_value)
        except ValueError:
            extracted_price = None

    # ---------------------------------------
    # Extract transportation service
    # ---------------------------------------

    extracted_service = None

    lowered = raw_text.lower()

    for keyword, service_name in SERVICE_KEYWORDS.items():
        if keyword in lowered:
            extracted_service = service_name
            break

    # ---------------------------------------
    # Return OCR result
    # ---------------------------------------

    return OcrResponse(
        raw_text=raw_text.strip(),
        extracted_service=extracted_service,
        extracted_price=extracted_price,
        verification_notice=(
            "Please verify the extracted information before analysis."
        ),
    )

