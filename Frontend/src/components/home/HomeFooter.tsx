import styles from '@/components/home/Home.module.css'

type HomeFooterProps = {
  appName: string
  onGoWorkspace: () => void
}

export function HomeFooter({ appName, onGoWorkspace }: HomeFooterProps) {
  return (
    <>
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaPanel}>
            <div className={styles.ctaPattern} />
            <div className={styles.ctaContent}>
              <h2>Ready to scale your legal research?</h2>
              <p>Join hundreds of firms using GovDoc Intellisense to turn documentation into actionable intelligence.</p>
              <div className={styles.ctaActions}>
                <button type="button" className={styles.ctaWhite} onClick={onGoWorkspace}>
                  Open Free Workspace
                </button>
                <button type="button" className={styles.ctaOutline}>
                  Schedule Demo
                </button>
              </div>
            </div>
            <span className={`material-symbols-outlined ${styles.shield}`} aria-hidden="true">
              shield
            </span>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerContent}`}>
          <div className={styles.footerBrand}>
            <div className={styles.logoWrap}>
              <div className={styles.logoBadge}>
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <span className={styles.logoText}>{appName}</span>
            </div>
            <p>Empowering legal professionals with AI-driven document precision and cognitive insights.</p>
            <small>© 2024 GovDoc Intellisense. All Rights Reserved.</small>
          </div>

          <div className={styles.footerLinksGrid}>
            <div>
              <span className={styles.footerTitle}>Platform</span>
              <button type="button" className={styles.footerLink} onClick={onGoWorkspace}>
                Workspace
              </button>
              <button type="button" className={styles.footerLink}>API Access</button>
              <button type="button" className={styles.footerLink}>Security</button>
            </div>
            <div>
              <span className={styles.footerTitle}>Resources</span>
              <button type="button" className={styles.footerLink}>Legal Blog</button>
              <button type="button" className={styles.footerLink}>Case Studies</button>
              <button type="button" className={styles.footerLink}>Docs</button>
            </div>
            <div>
              <span className={styles.footerTitle}>Company</span>
              <button type="button" className={styles.footerLink}>About Us</button>
              <button type="button" className={styles.footerLink}>Privacy</button>
              <button type="button" className={styles.footerLink}>Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
