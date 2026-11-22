
from typing import Literal

from pydantic import BaseModel


class AudioUploadResponse(BaseModel):
    status: Literal["validated"]
    filename: str
    size_bytes: int
