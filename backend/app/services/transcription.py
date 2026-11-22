from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from faster_whisper import WhisperModel


from app.core.config import (
    WHISPER_MODEL_SIZE,
    WHISPER_DEVICE,
    WHISPER_COMPUTE_TYPE,
    WHISPER_BEAM_SIZE,
)


@dataclass(frozen=True)
class TranscriptResult:
    text: str
    language: str
    duration_seconds: float


@lru_cache(maxsize=1)
def get_transcription_model() -> WhisperModel:
    return WhisperModel(
        WHISPER_MODEL_SIZE, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE_TYPE
    )


def transcribe_audio(
    audio_path: str | Path,
    language: str | None = None,
) -> TranscriptResult:
    model = get_transcription_model()

    segments, info = model.transcribe(
        str(audio_path),
        language=language,
        beam_size=WHISPER_BEAM_SIZE
    )

    transcript = " ".join(
        segment.text.strip() for segment in segments
    ).strip()

    return TranscriptResult(
        text=transcript,
        language=info.language,
        duration_seconds=info.duration
    )
