// HTTP communication with the backend's audio endpoints.
// Functions here throw Error objects with user-facing messages,
// so components never need to inspect HTTP responses.

const UPLOAD_URL = '/api/upload'

// Mirrors the backend's AudioUploadResponse model.
export interface AudioUploadResponse {
  status: 'validated'
  filename: string
  size_bytes: number
}

const UNREACHABLE_MESSAGE =
  'Could not reach the server. Make sure the backend is running and try again.'

export async function uploadAudio(file: File): Promise<AudioUploadResponse> {
  const formData = new FormData()
  // The browser sets the multipart Content-Type (with boundary) automatically.
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
  } catch {
    // fetch only rejects when no HTTP response was received (network failure).
    throw new Error(UNREACHABLE_MESSAGE)
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  try {
    return (await response.json()) as AudioUploadResponse
  } catch {
    throw new Error('The server returned an unexpected response.')
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  // Gateway errors mean the backend behind the proxy could not be reached
  // (the Vite dev proxy answers 502 when FastAPI is not running).
  if ([502, 503, 504].includes(response.status)) {
    return UNREACHABLE_MESSAGE
  }
  return (await readDetail(response)) ?? fallbackMessage(response.status)
}

// FastAPI errors look like { "detail": "..." }. For 422 validation errors
// `detail` is a list of objects, which is not suitable to show to users.
async function readDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'detail' in body &&
      typeof body.detail === 'string'
    ) {
      return body.detail
    }
  } catch {
    // Body was not JSON; fall back to a status-based message.
  }
  return null
}

function fallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The uploaded file is empty.'
    case 413:
      return 'The file is too large.'
    case 415:
      return 'Unsupported audio format.'
    case 422:
      return 'The server could not read the upload request.'
    default:
      return status >= 500
        ? `The server encountered an error (HTTP ${status}). Please try again.`
        : `Upload failed (HTTP ${status}).`
  }
}
