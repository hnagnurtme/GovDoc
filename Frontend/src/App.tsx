import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import './App.css'

type Page = 'home' | 'workspace'

type ChatFolder = {
  id: string
  name: string
  chatIds: string[]
}

type ChatItem = {
  id: string
  title: string
  updatedAt: string
  folderId: string
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
type ReasoningLevel = 'low' | 'medium' | 'high'

const initialFolders: ChatFolder[] = [
  { id: 'labor', name: 'Labor Law', chatIds: ['c1', 'c4'] },
  { id: 'civil', name: 'Civil Law', chatIds: ['c2'] },
  { id: 'criminal', name: 'Criminal Law', chatIds: ['c3'] },
  { id: 'contracts', name: 'Contracts', chatIds: [] },
]

const initialChats: ChatItem[] = [
  { id: 'c1', title: 'Employee contract termination', updatedAt: '10:25', folderId: 'labor' },
  { id: 'c2', title: 'Property ownership basics', updatedAt: 'Yesterday', folderId: 'civil' },
  { id: 'c3', title: 'Criminal liability overview', updatedAt: '2 days ago', folderId: 'criminal' },
  { id: 'c4', title: 'Overtime payment rights', updatedAt: '3 days ago', folderId: 'labor' },
]

const initialMessages: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1',
      role: 'assistant',
      content:
        'Welcome to GovDoc Intellisense. Ask a legal question after uploading a relevant document for better grounded answers.',
    },
  ],
  c2: [
    {
      id: 'm2',
      role: 'assistant',
      content: 'This conversation covers civil law topics. You can ask about ownership, contract validity, and obligations.',
    },
  ],
  c3: [
    {
      id: 'm3',
      role: 'assistant',
      content: 'This conversation focuses on criminal law. Ask concise questions for faster retrieval and clearer references.',
    },
  ],
  c4: [
    {
      id: 'm4',
      role: 'assistant',
      content: 'Overtime and labor compliance topics are ready. You can start with employee rights or employer obligations.',
    },
  ],
}

function App() {
  const [page, setPage] = useState<Page>(() =>
    window.location.pathname.includes('/workspace') ? 'workspace' : 'home',
  )
  const [folders, setFolders] = useState<ChatFolder[]>(initialFolders)
  const [chats, setChats] = useState<ChatItem[]>(initialChats)
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(initialMessages)
  const [activeChatId, setActiveChatId] = useState<string>('c1')
  const [historyFilter, setHistoryFilter] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    labor: true,
    civil: true,
    criminal: true,
    contracts: true,
  })
  const [composerText, setComposerText] = useState('')
  const [domain, setDomain] = useState('All')
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>('medium')
  const [showReasoningMenu, setShowReasoningMenu] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [fileName, setFileName] = useState('No file uploaded')
  const [filePages, setFilePages] = useState<number | null>(null)

  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const workflowSectionRef = useRef<HTMLElement | null>(null)
  const featuresSectionRef = useRef<HTMLElement | null>(null)
  const activeMessages = messagesByChat[activeChatId] || []
  const activeChat = chats.find((chat) => chat.id === activeChatId)

  useEffect(() => {
    const handler = () => {
      setPage(window.location.pathname.includes('/workspace') ? 'workspace' : 'home')
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const filteredChats = useMemo(() => {
    const q = historyFilter.trim().toLowerCase()
    if (!q) {
      return chats
    }
    return chats.filter((chat) => chat.title.toLowerCase().includes(q))
  }, [chats, historyFilter])

  const visibleFolders = useMemo(() => folders.slice(0, 2), [folders])
  const visibleRecentChats = useMemo(() => filteredChats.slice(0, 4), [filteredChats])

  const quickPrompts = [
    'Summarize obligations in this document',
    'List key legal risks',
    'Extract relevant labor law references',
  ]

  function navigateTo(next: Page) {
    const nextPath = next === 'home' ? '/' : '/workspace'
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPage(next)
  }

  function scrollToSection(section: 'workflow' | 'features') {
    const target = section === 'workflow' ? workflowSectionRef.current : featuresSectionRef.current
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  function startNewChat() {
    const id = `c${Date.now()}`
    const newChat: ChatItem = {
      id,
      title: 'New conversation',
      updatedAt: 'Just now',
      folderId: 'contracts',
    }
    setChats((prev) => [newChat, ...prev])
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === 'contracts' ? { ...folder, chatIds: [id, ...folder.chatIds] } : folder,
      ),
    )
    setMessagesByChat((prev) => ({
      ...prev,
      [id]: [
        {
          id: `m${Date.now()}`,
          role: 'assistant',
          content: 'New chat created. Upload a PDF and ask your legal question.',
        },
      ],
    }))
    setActiveChatId(id)
  }

  function sendMessage() {
    const text = composerText.trim()
    if (!text) {
      return
    }

    const userMessage: Message = {
      id: `m-user-${Date.now()}`,
      role: 'user',
      content: text,
    }
    const assistantMessage: Message = {
      id: `m-assistant-${Date.now() + 1}`,
      role: 'assistant',
      content:
        `Draft answer (${reasoningLevel.toUpperCase()} depth): based on the available context, this question should be mapped to relevant Vietnamese legal clauses. Please review cited references before final legal use.`,
      citations: ['Article 35 Labor Code 2019', 'Article 158 Civil Code 2015'],
    }

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), userMessage, assistantMessage],
    }))
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, title: text.slice(0, 48), updatedAt: 'Just now' } : chat,
      ),
    )
    setComposerText('')
    setShowReasoningMenu(false)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  function triggerUpload() {
    setUploadStatus('uploading')
    setTimeout(() => {
      setUploadStatus('success')
      setFilePages(Math.floor(Math.random() * 15) + 6)
    }, 1100)
  }

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setFileName(file.name)
    triggerUpload()
  }

  if (page === 'home') {
    return (
      <div className="page homepage">
        <header className="hp-topbar">
          <div className="hp-logo-wrap">
            <div className="hp-logo-badge">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <span className="hp-logo-text">GovDoc Intellisense</span>
          </div>
          <button type="button" className="hp-menu-button" aria-label="Open menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <nav className="hp-nav-desktop" aria-label="Primary">
            <button type="button" className="hp-nav-link hp-nav-link-active">
              Home
            </button>
            <button type="button" className="hp-nav-link" onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button type="button" className="hp-nav-link" onClick={() => scrollToSection('workflow')}>
              Workflow
            </button>
            <button type="button" className="hp-start-button" onClick={() => navigateTo('workspace')}>
              Start now
            </button>
          </nav>
        </header>

        <main>
          <section className="hp-hero hp-grid-pattern">
            <div className="hp-hero-overlay" />
            <div className="hp-hero-content">
              <div className="hp-hero-copy">
                <div className="hp-pill">
                  <span className="hp-pill-dot" />
                  AI-Powered Legal Research
                </div>
                <h1>Clear legal insights from your documents</h1>
                <p>
                  Upload legal PDFs, ask questions, and get structured answers with instant page-level references.
                </p>
                <div className="hp-hero-actions">
                  <button type="button" className="hp-cta-primary" onClick={() => navigateTo('workspace')}>
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
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6Aio6VtzPXYjPP1YPpfKPOxZYvTK9LrTzBbq-lr1iclAD0zEoAcrxZaVvP_2-11kYxWMQCL-kh9koofp4Rronyzw3VeIuEAxukrRIcCTDAXyncfRVW3DCCWmd3b69yW-itFJRfRkh4wsWL0GEGjoihzpDlDApXDa3I_WImPbC8n02JgBdjDQoUAMnrI4QBjPURkrVPFDNhnvHTlPsx90NkdVdwb_E17p3wt2kgVxpHilBVONs2VDs9XtBYrEMro3bdGhQApykY4"
                    alt="GovDoc Intellisense Workspace Preview"
                  />
                </div>
                <div className="hp-glow hp-glow-top" />
                <div className="hp-glow hp-glow-bottom" />
              </div>
            </div>
          </section>

          <section className="hp-process" ref={workflowSectionRef}>
            <div className="hp-container">
              <div className="hp-section-head-center">
                <span className="hp-kicker">The Process</span>
                <h2>Intelligence in three steps</h2>
              </div>
              <div className="hp-process-grid">
                <article className="hp-step-card">
                  <div className="hp-step-icon">
                    <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <div className="hp-step-index">01.</div>
                  <h3>Upload PDF</h3>
                  <p>Securely drag and drop your legal dossiers, contracts, or regulatory filings into our encrypted cloud.</p>
                </article>
                <article className="hp-step-card">
                  <div className="hp-step-icon">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div className="hp-step-index">02.</div>
                  <h3>Analyze context</h3>
                  <p>Our LLM-powered engine parses cross-references, defined terms, and jurisdictional nuances in seconds.</p>
                </article>
                <article className="hp-step-card">
                  <div className="hp-step-icon">
                    <span className="material-symbols-outlined">forum</span>
                  </div>
                  <div className="hp-step-index">03.</div>
                  <h3>Chat for answers</h3>
                  <p>Ask complex legal questions and receive structured responses mapped directly to page and clause numbers.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="hp-benefits hp-grid-pattern" ref={featuresSectionRef}>
            <div className="hp-container">
              <div className="hp-benefits-header">
                <div>
                  <h2>Built for precision</h2>
                  <p>Designed by legal experts for rigorous professional standards, where accuracy is non-negotiable.</p>
                </div>
                <button type="button" className="hp-inline-link">
                  Explore all capabilities <span className="material-symbols-outlined">east</span>
                </button>
              </div>

              <div className="hp-benefits-grid">
                <article className="hp-glass-card hp-benefit-large">
                  <div className="hp-benefit-large-content">
                    <div>
                      <div className="hp-mini-icon">
                        <span className="material-symbols-outlined">search_insights</span>
                      </div>
                      <h3>Focused search</h3>
                      <p>
                        Query specific data points across thousand-page documents without ever losing context. We isolate relevant sections with semantic pinpointing that understands legal intent.
                      </p>
                    </div>
                    <div className="hp-benefit-illustration">
                      <span className="material-symbols-outlined">travel_explore</span>
                    </div>
                  </div>
                </article>

                <article className="hp-benefit-primary">
                  <span className="material-symbols-outlined">history</span>
                  <div>
                    <h3>Organized history</h3>
                    <p>Every chat session is archived with searchable metadata tags. Retrace your research path instantly.</p>
                  </div>
                </article>

                <article className="hp-benefit-dark">
                  <span className="material-symbols-outlined">speed</span>
                  <div>
                    <h3>Fast workflow</h3>
                    <p>Reduce research time by 70%. Generate summaries and draft responses in real-time with verified sources.</p>
                  </div>
                </article>

                <article className="hp-glass-card hp-benefit-traceable">
                  <div className="hp-trace-grid">
                    <div>
                      <h3>Traceable references</h3>
                      <p>Every AI claim includes a clickable citation. Verify every word against the original source document instantly.</p>
                      <div className="hp-audit-badge">
                        <span className="material-symbols-outlined">verified</span>
                        Audit Ready Accuracy
                      </div>
                    </div>
                    <div className="hp-bars-box" aria-hidden="true">
                      <div className="hp-bar hp-bar-full" />
                      <div className="hp-bar hp-bar-75" />
                      <div className="hp-bar hp-bar-80 hp-bar-primary" />
                      <div className="hp-bar hp-bar-50" />
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="hp-cta-section">
            <div className="hp-container">
              <div className="hp-cta-panel">
                <div className="hp-cta-pattern" />
                <div className="hp-cta-content">
                  <h2>Ready to scale your legal research?</h2>
                  <p>Join hundreds of firms using GovDoc Intellisense to turn documentation into actionable intelligence.</p>
                  <div className="hp-cta-actions">
                    <button type="button" className="hp-cta-white" onClick={() => navigateTo('workspace')}>
                      Open Free Workspace
                    </button>
                    <button type="button" className="hp-cta-outline">
                      Schedule Demo
                    </button>
                  </div>
                </div>
                <span className="material-symbols-outlined hp-shield" aria-hidden="true">
                  shield
                </span>
              </div>
            </div>
          </section>
        </main>

        <footer className="hp-footer">
          <div className="hp-container hp-footer-content">
            <div className="hp-footer-brand">
              <div className="hp-logo-wrap">
                <div className="hp-logo-badge">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
                <span className="hp-logo-text">GovDoc Intellisense</span>
              </div>
              <p>Empowering legal professionals with AI-driven document precision and cognitive insights.</p>
              <small>© 2024 GovDoc Intellisense. All Rights Reserved.</small>
            </div>

            <div className="hp-footer-links-grid">
              <div>
                <span className="hp-footer-title">Platform</span>
                <button type="button" className="hp-footer-link">Workspace</button>
                <button type="button" className="hp-footer-link">API Access</button>
                <button type="button" className="hp-footer-link">Security</button>
              </div>
              <div>
                <span className="hp-footer-title">Resources</span>
                <button type="button" className="hp-footer-link">Legal Blog</button>
                <button type="button" className="hp-footer-link">Case Studies</button>
                <button type="button" className="hp-footer-link">Docs</button>
              </div>
              <div>
                <span className="hp-footer-title">Company</span>
                <button type="button" className="hp-footer-link">About Us</button>
                <button type="button" className="hp-footer-link">Privacy</button>
                <button type="button" className="hp-footer-link">Terms</button>
              </div>
            </div>
          </div>
        </footer>

        <nav className="hp-mobile-bottom" aria-label="Mobile bottom navigation">
          <div className="hp-mobile-item hp-mobile-item-active">
            <div className="hp-mobile-icon hp-mobile-icon-active">
              <span className="material-symbols-outlined">home</span>
            </div>
            <span>Home</span>
          </div>
          <button type="button" className="hp-mobile-item" onClick={() => navigateTo('workspace')}>
            <div className="hp-mobile-icon">
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
            <span>Work</span>
          </button>
          <button type="button" className="hp-mobile-item" onClick={() => navigateTo('workspace')}>
            <div className="hp-mobile-icon">
              <span className="material-symbols-outlined">folder_open</span>
            </div>
            <span>Files</span>
          </button>
        </nav>
      </div>
    )
  }

  return (
    <div className="page ws-shell">
      <header className="ws-topbar">
        <div className="ws-topbar-left">
          <button type="button" className="ws-brand" onClick={() => navigateTo('home')}>
            Intellisense Engine
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

      <div className="ws-layout">
        <aside className="ws-sidebar">
          <button type="button" className="ws-new-chat" onClick={startNewChat}>
            <span className="material-symbols-outlined">add</span>
            New Chat
          </button>

          <div className="ws-sidebar-upload">
            <label className="ws-upload-box" htmlFor="pdf-file">
              <input id="pdf-file" type="file" accept="application/pdf" onChange={onPickFile} />
              <strong>Upload PDF</strong>
              <small>Drag and drop PDF or click to select</small>
            </label>

            <div className="ws-upload-fields">
              <button type="button" className="btn btn-primary" onClick={triggerUpload}>
                Upload and analyze
              </button>
            </div>

            <p className="ws-upload-status">
              {uploadStatus === 'idle' && 'Waiting for upload'}
              {uploadStatus === 'uploading' && 'Uploading and processing...'}
              {uploadStatus === 'success' && 'Upload completed successfully'}
              {uploadStatus === 'error' && 'Upload failed. Please retry'}
            </p>
          </div>

          <div className="ws-sidebar-section">
            <p className="ws-section-title">Knowledge Base</p>
            <ul className="ws-folder-list">
              {visibleFolders.map((folder) => {
                const isActiveFolder = activeChat?.folderId === folder.id
                return (
                  <li key={folder.id}>
                    <button
                      type="button"
                      className={isActiveFolder ? 'ws-folder-row ws-folder-row-active' : 'ws-folder-row'}
                      onClick={() => toggleFolder(folder.id)}
                    >
                      <span className="material-symbols-outlined">folder</span>
                      <span>{folder.name}</span>
                    </button>
                    {expandedFolders[folder.id] && folder.chatIds.length > 0 && (
                      <div className="ws-folder-chats">
                        {folder.chatIds.map((chatId) => {
                          const chat = chats.find((item) => item.id === chatId)
                          if (!chat) {
                            return null
                          }
                          return (
                            <button
                              key={chat.id}
                              type="button"
                              className={chat.id === activeChatId ? 'ws-chat-link ws-chat-link-active' : 'ws-chat-link'}
                              onClick={() => setActiveChatId(chat.id)}
                            >
                              {chat.title}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="ws-sidebar-section ws-sidebar-grow">
            <p className="ws-section-title">Recent Chats</p>
            <input
              className="ws-search"
              type="search"
              placeholder="Search chat"
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value)}
            />
            <div className="ws-recent-list">
              {visibleRecentChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={chat.id === activeChatId ? 'ws-recent-item ws-recent-item-active' : 'ws-recent-item'}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <span>{chat.title}</span>
                  <small>{chat.updatedAt}</small>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="ws-chat-main">
          <header className="ws-chat-header">
            <div>
              <h1>Workspace</h1>
            </div>
            <div className="ws-chat-header-actions">
              <select value={domain} onChange={(event) => setDomain(event.target.value)}>
                <option>All</option>
                <option>lao_dong</option>
                <option>dan_su</option>
                <option>hinh_su</option>
                <option>hanh_chinh</option>
              </select>
              <button type="button" className="ws-icon-btn" aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </header>

          <div className="ws-chat-scroll">
            {activeMessages.map((message) => (
              <article key={message.id} className={message.role === 'user' ? 'ws-msg ws-msg-user' : 'ws-msg ws-msg-ai'}>
                <div className="ws-msg-avatar">
                  <span className="material-symbols-outlined">{message.role === 'user' ? 'person' : 'bolt'}</span>
                </div>
                <div className="ws-msg-body">
                  <p>{message.content}</p>
                  {message.citations && message.citations.length > 0 && (
                    <div className="ws-citations">
                      {message.citations.map((citation) => (
                        <span key={citation}>{citation}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
            <div ref={messageEndRef} />
          </div>

          <footer className="ws-composer-wrap">
            <div className="ws-quick-prompts">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" className="ws-prompt-chip" onClick={() => setComposerText(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <div className="ws-composer">
              <div className="ws-composer-icon">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Ask about compliance, statutes, or risk factors..."
              />
              <button type="button" className="ws-icon-btn" aria-label="Attach file">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <div className="ws-level-menu">
                <button
                  type="button"
                  className="ws-icon-btn"
                  aria-label="Reasoning level"
                  onClick={() => setShowReasoningMenu((prev) => !prev)}
                >
                  <span className="material-symbols-outlined">tune</span>
                </button>
                {showReasoningMenu && (
                  <div className="ws-reasoning-level" role="radiogroup" aria-label="Reasoning level">
                    <button
                      type="button"
                      className={reasoningLevel === 'low' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                      onClick={() => setReasoningLevel('low')}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      className={reasoningLevel === 'medium' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                      onClick={() => setReasoningLevel('medium')}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={reasoningLevel === 'high' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                      onClick={() => setReasoningLevel('high')}
                    >
                      High
                    </button>
                  </div>
                )}
              </div>
              <div className="ws-enter-hint" aria-hidden="true" title="Press Enter to send">
                <span className="material-symbols-outlined">keyboard_return</span>
              </div>
            </div>
          </footer>
        </main>

        <aside className="ws-doc-panel">
          <div className="ws-doc-topbar">
            <div className="ws-doc-name">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span>{fileName === 'No file uploaded' ? 'Municipal Bylaw No. 2024-15' : fileName}</span>
            </div>
            <div className="ws-zoom-controls">
              <button type="button" className="ws-icon-btn" aria-label="Zoom out">
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
              <span>85%</span>
              <button type="button" className="ws-icon-btn" aria-label="Zoom in">
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
          </div>

          <div className="ws-doc-preview-wrap">
            <div className="ws-doc-preview">
              <div className="ws-doc-strip" />
              <h3>Official Document</h3>
              <p>STATE DEPARTMENT OF MUNICIPAL AFFAIRS</p>
              <div className="ws-doc-lines">
                <div />
                <div />
                <div />
                <div className="ws-doc-highlight" />
                <div />
                <div />
                <div className="ws-doc-seal">Seal of Authenticity</div>
              </div>
            </div>
          </div>

          <div className="ws-metadata">
            <h4>Document Metadata</h4>
            <div className="ws-meta-grid">
              <div>
                <p>Document ID</p>
                <strong>{fileName !== 'No file uploaded' ? fileName.replace('.pdf', '') : 'GB-2024-X15'}</strong>
              </div>
              <div>
                <p>Upload Time</p>
                <strong>{uploadStatus === 'success' ? new Date().toLocaleTimeString() : 'N/A'}</strong>
              </div>
              <div>
                <p>Classification</p>
                <strong>Public/Gov</strong>
              </div>
              <div>
                <p>Pages</p>
                <strong>{filePages ?? 'N/A'}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
