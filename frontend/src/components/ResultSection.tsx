interface ResultSectionProps {
  title: string
}

function ResultSection({ title }: ResultSectionProps) {
  return (
    <section className="card result-section">
      <h3>{title}</h3>
      <p className="muted">Results will appear here after processing.</p>
    </section>
  )
}

export default ResultSection
