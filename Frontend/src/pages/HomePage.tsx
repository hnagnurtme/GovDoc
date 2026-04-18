import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchHomeData } from '../api/homeApi'
import { HomeBenefits } from '../components/home/HomeBenefits'
import { HomeFooter } from '../components/home/HomeFooter'
import { HomeHeader } from '../components/home/HomeHeader'
import { HomeHero } from '../components/home/HomeHero'
import { HomeMobileNav } from '../components/home/HomeMobileNav'
import { HomeProcess } from '../components/home/HomeProcess'
import type { HomeData, HomeSectionKey } from '../types/home'

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  const workflowSectionRef = useRef<HTMLElement | null>(null)
  const featuresSectionRef = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    void (async () => {
      const response = await fetchHomeData()
      setData(response)
    })()
  }, [])

  const goWorkspace = () => navigate('/workspace')

  const scrollToSection = (section: HomeSectionKey) => {
    const target = section === 'workflow' ? workflowSectionRef.current : featuresSectionRef.current
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!data) {
    return <div className="page homepage" />
  }

  return (
    <div className="page homepage">
      <HomeHeader data={data} onGoWorkspace={goWorkspace} onScroll={scrollToSection} />
      <main>
        <HomeHero data={data} onGoWorkspace={goWorkspace} />
        <HomeProcess processTitle={data.processTitle} processSteps={data.processSteps} sectionRef={workflowSectionRef} />
        <HomeBenefits sectionRef={featuresSectionRef} />
        <HomeFooter appName={data.appName} onGoWorkspace={goWorkspace} />
      </main>
      <HomeMobileNav onGoWorkspace={goWorkspace} />
    </div>
  )
}
