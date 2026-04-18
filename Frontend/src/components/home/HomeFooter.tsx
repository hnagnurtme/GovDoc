type HomeFooterProps = {
  appName: string
  onGoWorkspace: () => void
}

export function HomeFooter({ appName, onGoWorkspace }: HomeFooterProps) {
  return (
    <>
      <section className="hp-cta-section">
        <div className="hp-container">
          <div className="hp-cta-panel">
            <div className="hp-cta-pattern" />
            <div className="hp-cta-content">
              <h2>Ready to scale your legal research?</h2>
              <p>Join hundreds of firms using GovDoc Intellisense to turn documentation into actionable intelligence.</p>
              <div className="hp-cta-actions">
                <button type="button" className="hp-cta-white" onClick={onGoWorkspace}>
                  Open Free Workspace
                </button>
                <button type="button" className="hp-cta-outline">
                  Schedule Demo
                </button>
              </div>
            </div>
            <span className="material-symbols-outlined hp-shield" aria-hidden="true">
              shield
            </span>
          </div>
        </div>
      </section>

      <footer className="hp-footer">
        <div className="hp-container hp-footer-content">
          <div className="hp-footer-brand">
            <div className="hp-logo-wrap">
              <div className="hp-logo-badge">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <span className="hp-logo-text">{appName}</span>
            </div>
            <p>Empowering legal professionals with AI-driven document precision and cognitive insights.</p>
            <small>© 2024 GovDoc Intellisense. All Rights Reserved.</small>
          </div>

          <div className="hp-footer-links-grid">
            <div>
              <span className="hp-footer-title">Platform</span>
              <button type="button" className="hp-footer-link" onClick={onGoWorkspace}>
                Workspace
              </button>
              <button type="button" className="hp-footer-link">API Access</button>
              <button type="button" className="hp-footer-link">Security</button>
            </div>
            <div>
              <span className="hp-footer-title">Resources</span>
              <button type="button" className="hp-footer-link">Legal Blog</button>
              <button type="button" className="hp-footer-link">Case Studies</button>
              <button type="button" className="hp-footer-link">Docs</button>
            </div>
            <div>
              <span className="hp-footer-title">Company</span>
              <button type="button" className="hp-footer-link">About Us</button>
              <button type="button" className="hp-footer-link">Privacy</button>
              <button type="button" className="hp-footer-link">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
