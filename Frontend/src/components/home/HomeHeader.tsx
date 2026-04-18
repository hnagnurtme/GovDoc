import type { HomeData, HomeSectionKey } from '@/types/home'
import styles from '@/components/home/Home.module.css'

type HomeHeaderProps = {
  data: HomeData
  onGoWorkspace: () => void
  onScroll: (section: HomeSectionKey) => void
}

export function HomeHeader({ data, onGoWorkspace, onScroll }: HomeHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.logoWrap}>
        <div className={styles.logoBadge}>
          <span className="material-symbols-outlined">gavel</span>
        </div>
        <span className={styles.logoText}>{data.appName}</span>
      </div>
      <button type="button" className={styles.menuButton} aria-label="Open menu">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <nav className={styles.navDesktop} aria-label="Primary">
        <button type="button" className={`${styles.navLink} ${styles.navLinkActive}`}>
          Home
        </button>
        <button type="button" className={styles.navLink} onClick={() => onScroll('features')}>
          Features
        </button>
        <button type="button" className={styles.navLink} onClick={() => onScroll('workflow')}>
          Workflow
        </button>
        <button type="button" className={styles.startButton} onClick={onGoWorkspace}>
          Start now
        </button>
      </nav>
    </header>
  )
}
