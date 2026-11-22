
from typing import Literal

from pydantic import BaseModel


class AudioUploadResponse(BaseModel):
    status: Literal["validated"]
    filename: str
    size_bytes: int

class TranscriptionResponse(BaseModel):
    text: str
    language: str
    duration_seconds: float
