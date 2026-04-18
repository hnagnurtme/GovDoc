import type { HomeData } from '../types/home'

export const homeMockData: HomeData = {
  appName: 'GovDoc Intellisense',
  heroTagline: 'AI-Powered Legal Research',
  heroTitle: 'Clear legal insights from your documents',
  heroDescription:
    'Upload legal PDFs, ask questions, and get structured answers with instant page-level references.',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAE6Aio6VtzPXYjPP1YPpfKPOxZYvTK9LrTzBbq-lr1iclAD0zEoAcrxZaVvP_2-11kYxWMQCL-kh9koofp4Rronyzw3VeIuEAxukrRIcCTDAXyncfRVW3DCCWmd3b69yW-itFJRfRkh4wsWL0GEGjoihzpDlDApXDa3I_WImPbC8n02JgBdjDQoUAMnrI4QBjPURkrVPFDNhnvHTlPsx90NkdVdwb_E17p3wt2kgVxpHilBVONs2VDs9XtBYrEMro3bdGhQApykY4',
  processTitle: 'Intelligence in three steps',
  processSteps: [
    {
      id: 's1',
      icon: 'upload_file',
      title: 'Upload PDF',
      description:
        'Securely drag and drop your legal dossiers, contracts, or regulatory filings into our encrypted cloud.',
    },
    {
      id: 's2',
      icon: 'psychology',
      title: 'Analyze context',
      description:
        'Our LLM-powered engine parses cross-references, defined terms, and jurisdictional nuances in seconds.',
    },
    {
      id: 's3',
      icon: 'forum',
      title: 'Chat for answers',
      description:
        'Ask complex legal questions and receive structured responses mapped directly to page and clause numbers.',
    },
  ],
}
