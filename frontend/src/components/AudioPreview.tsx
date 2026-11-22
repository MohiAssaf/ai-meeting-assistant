import { useEffect, useRef, useState } from 'react'

interface AudioPreviewProps {
  file: File
}

// Plays a local audio File. Owns the temporary blob URL for the file.
// Render with a `key` per file so the preview-failed state resets on a new file.
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

export default AudioPreview
