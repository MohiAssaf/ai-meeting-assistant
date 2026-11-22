import { useState } from 'react'
import AudioUpload from './components/AudioUpload'
import ResultSection from './components/ResultSection'
import './App.css'

const RESULT_SECTIONS = ['Transcript', 'Summary', 'Topics', 'Decisions', 'Action items']

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        <section aria-labelledby="upload-heading" className="upload-section">
          <h2 id="upload-heading">Recording</h2>
          <AudioUpload file={selectedFile} onFileChange={setSelectedFile} />

          <div className="process">
            <button
              type="button"
              className="button primary"
              disabled
              aria-describedby="process-hint"
            >
              Process recording
            </button>
            <p id="process-hint" className="muted">
              Processing will be available once the backend is connected.
            </p>
          </div>
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
