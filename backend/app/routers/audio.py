
from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.schemas.audio import AudioUploadResponse
from app.services.audio_validation import validate_audio_upload


router = APIRouter(tags=["Audio"])


@router.post(
    "/upload",
    response_model=AudioUploadResponse,
)
async def upload_audio(
    file: Annotated[UploadFile, File()],
) -> AudioUploadResponse:
    return await validate_audio_upload(file)
