type HomeBenefitsProps = {
  sectionRef: React.RefObject<HTMLElement | null>
}

export function HomeBenefits({ sectionRef }: HomeBenefitsProps) {
  return (
    <section className="hp-benefits hp-grid-pattern" ref={sectionRef}>
      <div className="hp-container">
        <div className="hp-benefits-header">
          <div>
            <h2>Built for precision</h2>
            <p>Designed by legal experts for rigorous professional standards, where accuracy is non-negotiable.</p>
          </div>
          <button type="button" className="hp-inline-link">
            Explore all capabilities <span className="material-symbols-outlined">east</span>
          </button>
        </div>

        <div className="hp-benefits-grid">
          <article className="hp-glass-card hp-benefit-large">
            <div className="hp-benefit-large-content">
              <div>
                <div className="hp-mini-icon">
                  <span className="material-symbols-outlined">search_insights</span>
                </div>
                <h3>Focused search</h3>
                <p>
                  Query specific data points across thousand-page documents without ever losing context. We isolate
                  relevant sections with semantic pinpointing that understands legal intent.
                </p>
              </div>
              <div className="hp-benefit-illustration">
                <span className="material-symbols-outlined">travel_explore</span>
              </div>
            </div>
          </article>

          <article className="hp-benefit-primary">
            <span className="material-symbols-outlined">history</span>
            <div>
              <h3>Organized history</h3>
              <p>Every chat session is archived with searchable metadata tags. Retrace your research path instantly.</p>
            </div>
          </article>

          <article className="hp-benefit-dark">
            <span className="material-symbols-outlined">speed</span>
            <div>
              <h3>Fast workflow</h3>
              <p>Reduce research time by 70%. Generate summaries and draft responses in real-time with verified sources.</p>
            </div>
          </article>

          <article className="hp-glass-card hp-benefit-traceable">
            <div className="hp-trace-grid">
              <div>
                <h3>Traceable references</h3>
                <p>Every AI claim includes a clickable citation. Verify every word against the original source document instantly.</p>
                <div className="hp-audit-badge">
                  <span className="material-symbols-outlined">verified</span>
                  Audit Ready Accuracy
                </div>
              </div>
              <div className="hp-bars-box" aria-hidden="true">
                <div className="hp-bar hp-bar-full" />
                <div className="hp-bar hp-bar-75" />
                <div className="hp-bar hp-bar-80 hp-bar-primary" />
                <div className="hp-bar hp-bar-50" />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
