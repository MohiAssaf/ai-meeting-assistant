import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import AudioPreview from './AudioPreview'
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  SUPPORTED_FORMATS_LABEL,
  formatFileSize,
  getFileExtension,
  validateAudioFile,
} from '../utils/audioFile'

interface AudioUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  // Prevents changing the file, e.g. while it is being uploaded.
  disabled?: boolean
}

// File selection: picker, drag-and-drop, validation feedback, and the selected-file view.
function AudioUpload({ file, onFileChange, disabled = false }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (disabled || !files || files.length === 0) return
    if (files.length > 1) {
      setError('Please select one recording at a time.')
      return
    }
    const candidate = files[0]
    const message = validateAudioFile(candidate)
    if (message) {
      // Keep any previously selected valid file.
      setError(message)
      return
    }
    setError(null)
    onFileChange(candidate)
  }

  function openFilePicker() {
    if (disabled) return
    inputRef.current?.click()
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    // Reset so choosing the same file again still triggers onChange.
    event.target.value = ''
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    // preventDefault marks this element as a valid drop target. It is still
    // called when disabled, so a dropped file isn't opened in a new tab.
    event.preventDefault()
    if (disabled) {
      event.dataTransfer.dropEffect = 'none'
      return
    }
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
    if (disabled) return
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
        accept={ACCEPTED_FILE_TYPES}
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
                {formatFileSize(file.size)} · {getFileExtension(file.name).slice(1).toUpperCase()}
              </p>
            </div>
          </div>

          <AudioPreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />

          <div className="file-actions">
            <button
              type="button"
              className="button secondary"
              onClick={openFilePicker}
              disabled={disabled}
            >
              Replace
            </button>
            <button
              type="button"
              className="button secondary danger"
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="dropzone"
          onClick={openFilePicker}
          disabled={disabled}
          aria-describedby="upload-hint"
        >
          <span className="dropzone-icon" aria-hidden="true">↑</span>
          <span className="dropzone-title">
            Drag &amp; drop a recording or <span className="link">browse</span>
          </span>
          <span id="upload-hint" className="muted">
            {SUPPORTED_FORMATS_LABEL} · up to {MAX_FILE_SIZE_MB} MB
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

export default AudioUpload
