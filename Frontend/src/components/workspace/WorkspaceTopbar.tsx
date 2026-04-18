import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceTopbarProps = {
  onGoHome: () => void
  isSidebarHidden: boolean
  onToggleSidebar: () => void
}

export function WorkspaceTopbar({ onGoHome, isSidebarHidden, onToggleSidebar }: WorkspaceTopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={isSidebarHidden ? 'Show left sidebar' : 'Hide left sidebar'}
          title={isSidebarHidden ? 'Show left sidebar' : 'Hide left sidebar'}
          onClick={onToggleSidebar}
        >
          <span className="material-symbols-outlined">{isSidebarHidden ? 'left_panel_open' : 'left_panel_close'}</span>
        </button>
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
