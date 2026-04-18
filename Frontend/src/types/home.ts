export type HomeSectionKey = 'workflow' | 'features'

export type HomeNavItem = {
  label: string
  sectionKey?: HomeSectionKey
  route?: string
}

export type ProcessStep = {
  id: string
  icon: string
  title: string
  description: string
}

export type HomeData = {
  appName: string
  heroTagline: string
  heroTitle: string
  heroDescription: string
  heroImage: string
  processTitle: string
  processSteps: ProcessStep[]
}
