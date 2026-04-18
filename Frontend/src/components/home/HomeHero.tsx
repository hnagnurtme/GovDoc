import type { HomeData } from '../../types/home'

type HomeHeroProps = {
  data: HomeData
  onGoWorkspace: () => void
}

export function HomeHero({ data, onGoWorkspace }: HomeHeroProps) {
  return (
    <section className="hp-hero hp-grid-pattern">
      <div className="hp-hero-overlay" />
      <div className="hp-hero-content">
        <div className="hp-hero-copy">
          <div className="hp-pill">
            <span className="hp-pill-dot" />
            {data.heroTagline}
          </div>
          <h1>{data.heroTitle}</h1>
          <p>{data.heroDescription}</p>
          <div className="hp-hero-actions">
            <button type="button" className="hp-cta-primary" onClick={onGoWorkspace}>
              <span>Open Workspace</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button type="button" className="hp-cta-secondary">
              See demo
            </button>
          </div>
        </div>
        <div className="hp-hero-media">
          <div className="hp-hero-image-wrap">
            <img src={data.heroImage} alt="GovDoc Intellisense Workspace Preview" />
          </div>
          <div className="hp-glow hp-glow-top" />
          <div className="hp-glow hp-glow-bottom" />
        </div>
      </div>
    </section>
  )
}
