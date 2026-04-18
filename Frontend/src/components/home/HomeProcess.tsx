import type { ProcessStep } from '@/types/home'
import styles from '@/components/home/Home.module.css'

type HomeProcessProps = {
  processTitle: string
  processSteps: ProcessStep[]
  sectionRef: React.RefObject<HTMLElement | null>
}

export function HomeProcess({ processTitle, processSteps, sectionRef }: HomeProcessProps) {
  return (
    <section className={styles.process} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.sectionHeadCenter}>
          <span className={styles.kicker}>The Process</span>
          <h2>{processTitle}</h2>
        </div>
        <div className={styles.processGrid}>
          {processSteps.map((step, index) => (
            <article key={step.id} className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <span className="material-symbols-outlined">{step.icon}</span>
              </div>
              <div className={styles.stepIndex}>{String(index + 1).padStart(2, '0')}.</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
