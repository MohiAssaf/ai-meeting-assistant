
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import (
    ALLOWED_AUDIO_EXTENSIONS,
    MAX_AUDIO_SIZE_BYTES,
)
from app.schemas.audio import AudioUploadResponse


async def validate_audio_upload(
    file: UploadFile,
) -> AudioUploadResponse:
    filename = Path(
        (file.filename or "").replace("\\", "/")
    ).name

    extension = Path(filename).suffix.lower()

    try:
        if extension not in ALLOWED_AUDIO_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail="Unsupported audio format.",
            )

        size = 0

        while chunk := await file.read(1024 * 1024):
            size += len(chunk)

            if size > MAX_AUDIO_SIZE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail="File exceeds the 20 MB limit.",
                )

        if size == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        return AudioUploadResponse(
            status="validated",
            filename=filename,
            size_bytes=size,
        )

    finally:
        await file.seek(0)
