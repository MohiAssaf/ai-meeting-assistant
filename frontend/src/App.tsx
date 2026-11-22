import { useState } from 'react'
import { uploadAudio } from './api/audio'
import AudioUpload from './components/AudioUpload'
import ResultSection from './components/ResultSection'
import UploadStatus from './components/UploadStatus'
import type { UploadState } from './components/UploadStatus'
import './App.css'

const RESULT_SECTIONS = ['Transcript', 'Summary', 'Topics', 'Decisions', 'Action items']

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })

  const isUploading = uploadState.status === 'uploading'

  function handleFileChange(file: File | null) {
    setSelectedFile(file)
    // A previous result or error belongs to the previous file.
    setUploadState({ status: 'idle' })
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return

    setUploadState({ status: 'uploading' })
    try {
      const result = await uploadAudio(selectedFile)
      setUploadState({ status: 'success', result })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
      setUploadState({ status: 'error', message })
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>AI Meeting Assistant</h1>
        <p className="lead">
          Upload a short meeting recording to get a transcript, a summary, key topics, decisions,
          and action items.
        </p>
      </header>

      <main>
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading">Recording</h2>
          <AudioUpload
            file={selectedFile}
            onFileChange={handleFileChange}
            disabled={isUploading}
          />

          <div className="process">
            <button
              type="button"
              className="button primary"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              aria-describedby="process-hint"
            >
              {isUploading ? 'Uploading…' : 'Upload recording'}
            </button>
            <p id="process-hint" className="muted">
              The server currently validates the recording. Transcription and summaries will be
              added later.
            </p>
          </div>

          <UploadStatus state={uploadState} />
        </section>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading">Results</h2>
          <div className="results-grid">
            {RESULT_SECTIONS.map((title) => (
              <ResultSection key={title} title={title} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
