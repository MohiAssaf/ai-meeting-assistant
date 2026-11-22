import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ACCEPT = '.mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a'

interface AudioUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

// Returns an error message, or null if the file is acceptable.
function validateFile(file: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    return 'Unsupported file type. Please choose an MP3, WAV, or M4A file.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is ${formatSize(file.size)} — the limit is 20 MB.`
  }
  if (file.size === 0) {
    return 'The selected file is empty.'
  }
  return null
}

function AudioUpload({ file, onFileChange }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (files.length > 1) {
      setError('Please select one recording at a time.')
      return
    }
    const candidate = files[0]
    const message = validateFile(candidate)
    if (message) {
      // Keep any previously selected valid file.
      setError(message)
      return
    }
    setError(null)
    onFileChange(candidate)
  }

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    // Reset so choosing the same file again still triggers onChange.
    event.target.value = ''
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    // preventDefault marks this element as a valid drop target.
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    // Ignore dragleave events caused by moving between child elements.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function handleRemove() {
    setError(null)
    onFileChange(null)
  }

  return (
    <div
      className={`card upload${isDragging ? ' is-dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {file ? (
        <div className="selected-file">
          <div className="file-details">
            <span className="file-icon" aria-hidden="true">♪</span>
            <div className="file-meta">
              <p className="file-name" title={file.name}>{file.name}</p>
              <p className="muted">
                {formatSize(file.size)} · {getExtension(file.name).slice(1).toUpperCase()}
              </p>
            </div>
          </div>

          <AudioPreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />

          <div className="file-actions">
            <button type="button" className="button secondary" onClick={openFilePicker}>
              Replace
            </button>
            <button type="button" className="button secondary danger" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="dropzone"
          onClick={openFilePicker}
          aria-describedby="upload-hint"
        >
          <span className="dropzone-icon" aria-hidden="true">↑</span>
          <span className="dropzone-title">
            Drag &amp; drop a recording or <span className="link">browse</span>
          </span>
          <span id="upload-hint" className="muted">
            MP3, WAV, or M4A · up to 20 MB
          </span>
        </button>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface AudioPreviewProps {
  file: File
}

function AudioPreview({ file }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [previewFailed, setPreviewFailed] = useState(false)

  // Create a temporary blob URL for the file and release it when the file
  // changes or the component unmounts, so the browser can free the memory.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const url = URL.createObjectURL(file)
    audio.src = url
    return () => {
      audio.removeAttribute('src')
      audio.load()
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="preview">
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        onError={() => setPreviewFailed(true)}
        hidden={previewFailed}
        aria-label={`Preview of ${file.name}`}
      />
      {previewFailed && (
        <p className="notice">
          Your browser can’t preview this audio format, but the file is still selected and can be
          processed.
        </p>
      )}
    </div>
  )
}

export default AudioUpload
