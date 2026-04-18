import type { ProcessStep } from '../../types/home'

type HomeProcessProps = {
  processTitle: string
  processSteps: ProcessStep[]
  sectionRef: React.RefObject<HTMLElement | null>
}

export function HomeProcess({ processTitle, processSteps, sectionRef }: HomeProcessProps) {
  return (
    <section className="hp-process" ref={sectionRef}>
      <div className="hp-container">
        <div className="hp-section-head-center">
          <span className="hp-kicker">The Process</span>
          <h2>{processTitle}</h2>
        </div>
        <div className="hp-process-grid">
          {processSteps.map((step, index) => (
            <article key={step.id} className="hp-step-card">
              <div className="hp-step-icon">
                <span className="material-symbols-outlined">{step.icon}</span>
              </div>
              <div className="hp-step-index">{String(index + 1).padStart(2, '0')}.</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
