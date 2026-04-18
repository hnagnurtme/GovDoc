import type { HomeData, HomeSectionKey } from '../../types/home'

type HomeHeaderProps = {
  data: HomeData
  onGoWorkspace: () => void
  onScroll: (section: HomeSectionKey) => void
}

export function HomeHeader({ data, onGoWorkspace, onScroll }: HomeHeaderProps) {
  return (
    <header className="hp-topbar">
      <div className="hp-logo-wrap">
        <div className="hp-logo-badge">
          <span className="material-symbols-outlined">gavel</span>
        </div>
        <span className="hp-logo-text">{data.appName}</span>
      </div>
      <button type="button" className="hp-menu-button" aria-label="Open menu">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <nav className="hp-nav-desktop" aria-label="Primary">
        <button type="button" className="hp-nav-link hp-nav-link-active">
          Home
        </button>
        <button type="button" className="hp-nav-link" onClick={() => onScroll('features')}>
          Features
        </button>
        <button type="button" className="hp-nav-link" onClick={() => onScroll('workflow')}>
          Workflow
        </button>
        <button type="button" className="hp-start-button" onClick={onGoWorkspace}>
          Start now
        </button>
      </nav>
    </header>
  )
}
