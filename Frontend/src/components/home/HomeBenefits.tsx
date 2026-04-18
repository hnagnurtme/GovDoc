import styles from '@/components/home/Home.module.css'

type HomeBenefitsProps = {
  sectionRef: React.RefObject<HTMLElement | null>
}

export function HomeBenefits({ sectionRef }: HomeBenefitsProps) {
  return (
    <section className={`${styles.benefits} ${styles.gridPattern}`} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.benefitsHeader}>
          <div>
            <h2>Built for precision</h2>
            <p>Designed by legal experts for rigorous professional standards, where accuracy is non-negotiable.</p>
          </div>
          <button type="button" className={styles.inlineLink}>
            Explore all capabilities <span className="material-symbols-outlined">east</span>
          </button>
        </div>

        <div className={styles.benefitsGrid}>
          <article className={`${styles.glassCard} ${styles.benefitLarge}`}>
            <div className={styles.benefitLargeContent}>
              <div>
                <div className={styles.miniIcon}>
                  <span className="material-symbols-outlined">search_insights</span>
                </div>
                <h3>Focused search</h3>
                <p>
                  Query specific data points across thousand-page documents without ever losing context. We isolate
                  relevant sections with semantic pinpointing that understands legal intent.
                </p>
              </div>
              <div className={styles.benefitIllustration}>
                <span className="material-symbols-outlined">travel_explore</span>
              </div>
            </div>
          </article>

          <article className={styles.benefitPrimary}>
            <span className="material-symbols-outlined">history</span>
            <div>
              <h3>Organized history</h3>
              <p>Every chat session is archived with searchable metadata tags. Retrace your research path instantly.</p>
            </div>
          </article>

          <article className={styles.benefitDark}>
            <span className="material-symbols-outlined">speed</span>
            <div>
              <h3>Fast workflow</h3>
              <p>Reduce research time by 70%. Generate summaries and draft responses in real-time with verified sources.</p>
            </div>
          </article>

          <article className={`${styles.glassCard} ${styles.benefitTraceable}`}>
            <div className={styles.traceGrid}>
              <div>
                <h3>Traceable references</h3>
                <p>Every AI claim includes a clickable citation. Verify every word against the original source document instantly.</p>
                <div className={styles.auditBadge}>
                  <span className="material-symbols-outlined">verified</span>
                  Audit Ready Accuracy
                </div>
              </div>
              <div className={styles.barsBox} aria-hidden="true">
                <div className={`${styles.bar} ${styles.barFull}`} />
                <div className={`${styles.bar} ${styles.bar75}`} />
                <div className={`${styles.bar} ${styles.bar80} ${styles.barPrimary}`} />
                <div className={`${styles.bar} ${styles.bar50}`} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
