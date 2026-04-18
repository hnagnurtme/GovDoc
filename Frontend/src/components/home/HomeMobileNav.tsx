type HomeMobileNavProps = {
  onGoWorkspace: () => void
}

export function HomeMobileNav({ onGoWorkspace }: HomeMobileNavProps) {
  return (
    <nav className="hp-mobile-bottom" aria-label="Mobile bottom navigation">
      <div className="hp-mobile-item hp-mobile-item-active">
        <div className="hp-mobile-icon hp-mobile-icon-active">
          <span className="material-symbols-outlined">home</span>
        </div>
        <span>Home</span>
      </div>
      <button type="button" className="hp-mobile-item" onClick={onGoWorkspace}>
        <div className="hp-mobile-icon">
          <span className="material-symbols-outlined">chat_bubble</span>
        </div>
        <span>Work</span>
      </button>
      <button type="button" className="hp-mobile-item" onClick={onGoWorkspace}>
        <div className="hp-mobile-icon">
          <span className="material-symbols-outlined">folder_open</span>
        </div>
        <span>Files</span>
      </button>
    </nav>
  )
}
