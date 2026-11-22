// Rules for which audio recordings the app accepts, kept separate from the UI.
// Keep these in sync with the backend's upload limits.

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a']

export const SUPPORTED_FORMATS_LABEL = 'MP3, WAV, or M4A'

export const MAX_FILE_SIZE_MB = 20
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Value for <input accept>. Filters the file picker only; drag-and-drop bypasses it,
// so every file must still go through validateAudioFile.
export const ACCEPTED_FILE_TYPES =
  '.mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a'

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Returns a user-facing error message, or null if the file is acceptable.
// Checks the extension rather than the MIME type, which browsers report
// inconsistently for M4A files.
export function validateAudioFile(file: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(getFileExtension(file.name))) {
    return `Unsupported file type. Please choose an ${SUPPORTED_FORMATS_LABEL} file.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is ${formatFileSize(file.size)} — the limit is ${MAX_FILE_SIZE_MB} MB.`
  }
  if (file.size === 0) {
    return 'The selected file is empty.'
  }
  return null
}
