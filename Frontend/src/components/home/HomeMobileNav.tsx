import styles from '@/components/home/Home.module.css'

type HomeMobileNavProps = {
  onGoWorkspace: () => void
}

export function HomeMobileNav({ onGoWorkspace }: HomeMobileNavProps) {
  return (
    <nav className={styles.mobileBottom} aria-label="Mobile bottom navigation">
      <div className={`${styles.mobileItem} ${styles.mobileItemActive}`}>
        <div className={`${styles.mobileIcon} ${styles.mobileIconActive}`}>
          <span className="material-symbols-outlined">home</span>
        </div>
        <span>Home</span>
      </div>
      <button type="button" className={styles.mobileItem} onClick={onGoWorkspace}>
        <div className={styles.mobileIcon}>
          <span className="material-symbols-outlined">chat_bubble</span>
        </div>
        <span>Work</span>
      </button>
      <button type="button" className={styles.mobileItem} onClick={onGoWorkspace}>
        <div className={styles.mobileIcon}>
          <span className="material-symbols-outlined">folder_open</span>
        </div>
        <span>Files</span>
      </button>
    </nav>
  )
}
