import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile

from starlette.concurrency import run_in_threadpool

from app.services.transcription import transcribe_audio

from typing import Annotated
from fastapi import APIRouter, File, UploadFile, HTTPException

from app.schemas.audio import AudioUploadResponse, TranscriptionResponse
from app.services.audio_validation import validate_audio_upload
from av.error import InvalidDataError

router = APIRouter(tags=["Audio"])


@router.post(
    "/upload",
    response_model=AudioUploadResponse,
)
async def upload_audio(
    file: Annotated[UploadFile, File()],
) -> AudioUploadResponse:
    try:
        return await validate_audio_upload(file)
    finally:
        await file.close()


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
)
async def transcribe_uploaded_audio(
    file: Annotated[UploadFile, File],
    language: str | None = None,
) -> TranscriptionResponse:
    try:
        validated = await validate_audio_upload(file)

        suffix = Path(validated.filename).suffix.lower()

        with NamedTemporaryFile(suffix=suffix) as temp_file:
            await run_in_threadpool(
                shutil.copyfileobj,
                file.file,
                temp_file
            )

            temp_file.flush()

            try:
                result = await run_in_threadpool(
                    transcribe_audio,
                    temp_file.name,
                    language,
                )
            except InvalidDataError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded file does not contain valid audio.",
                ) from exc

        return result

    finally:
        await file.close()
