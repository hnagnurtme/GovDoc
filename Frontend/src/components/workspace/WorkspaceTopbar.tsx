import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceTopbarProps = {
  onGoHome: () => void
}

export function WorkspaceTopbar({ onGoHome }: WorkspaceTopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button type="button" className={styles.brand} onClick={onGoHome}>
          GovDoc Intellisense
        </button>
        <nav className={styles.topNav} aria-label="Workspace navigation">
          <span className={styles.topNavActive}>Workspace</span>
          <span>Libraries</span>
          <span>Analytics</span>
        </nav>
      </div>
      <div className={styles.topbarRight}>
        <button type="button" className={styles.iconBtn} aria-label="History">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Help">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className={styles.avatar}>AI</div>
      </div>
    </header>
  )
}
