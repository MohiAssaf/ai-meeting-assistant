import type { AudioUploadResponse } from '../api/audio'
import { formatFileSize } from '../utils/audioFile'

// The lifecycle of one upload request. Owned by App, rendered here.
export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; result: AudioUploadResponse }
  | { status: 'error'; message: string }

interface UploadStatusProps {
  state: UploadState
}

function UploadStatus({ state }: UploadStatusProps) {
  return (
    <div className="upload-status">
      {/* Kept mounted so screen readers announce changes to its content. */}
      <div aria-live="polite">
        {state.status === 'uploading' && <p className="muted">Uploading recording…</p>}

        {state.status === 'success' && (
          <div className="success">
            <p className="success-title">Recording validated by the server</p>
            <dl className="success-details">
              <dt>File</dt>
              <dd>{state.result.filename}</dd>
              <dt>Size</dt>
              <dd>{formatFileSize(state.result.size_bytes)}</dd>
              <dt>Status</dt>
              <dd>{state.result.status}</dd>
            </dl>
          </div>
        )}
      </div>

      {state.status === 'error' && (
        <p className="error" role="alert">
          {state.message}
        </p>
      )}
    </div>
  )
}

export default UploadStatus
