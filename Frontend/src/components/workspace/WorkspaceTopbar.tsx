type WorkspaceTopbarProps = {
  onGoHome: () => void
}

export function WorkspaceTopbar({ onGoHome }: WorkspaceTopbarProps) {
  return (
    <header className="ws-topbar">
      <div className="ws-topbar-left">
        <button type="button" className="ws-brand" onClick={onGoHome}>
          GovDoc Intellisense
        </button>
        <nav className="ws-top-nav" aria-label="Workspace navigation">
          <span className="ws-top-nav-active">Workspace</span>
          <span>Libraries</span>
          <span>Analytics</span>
        </nav>
      </div>
      <div className="ws-topbar-right">
        <button type="button" className="ws-icon-btn" aria-label="History">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button type="button" className="ws-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" className="ws-icon-btn" aria-label="Help">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="ws-avatar">AI</div>
      </div>
    </header>
  )
}
