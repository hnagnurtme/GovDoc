import type { HomeData } from '@/types/home'
import styles from '@/components/home/Home.module.css'

type HomeHeroProps = {
  data: HomeData
  onGoWorkspace: () => void
}

export function HomeHero({ data, onGoWorkspace }: HomeHeroProps) {
  return (
    <section className={`${styles.hero} ${styles.gridPattern}`}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <div className={styles.heroCopy}>
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            {data.heroTagline}
          </div>
          <h1>{data.heroTitle}</h1>
          <p>{data.heroDescription}</p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.ctaPrimary} onClick={onGoWorkspace}>
              <span>Open Workspace</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button type="button" className={styles.ctaSecondary}>
              See demo
            </button>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <div className={styles.heroImageWrap}>
            <img src={data.heroImage} alt="GovDoc Intellisense Workspace Preview" />
          </div>
          <div className={`${styles.glow} ${styles.glowTop}`} />
          <div className={`${styles.glow} ${styles.glowBottom}`} />
        </div>
      </div>
    </section>
  )
}
