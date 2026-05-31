import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUserProfile } from '@/api/auth'
import { fetchDocumentsApi, fetchWorkspaceData } from '@/api/workspaceApi'
import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar'
import type { UserProfile, StoredDocument } from '@/types/workspace'
import { translations } from '@/utils/translations'
import styles from '@/components/workspace/Workspace.module.css'

export function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const [chatsCount, setChatsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [lang, setLang] = useState<'vi' | 'en'>('vi')

  useEffect(() => {
    const savedLang = localStorage.getItem('govdoc.lang') || 'vi'
    setLang(savedLang as 'vi' | 'en')

    void (async () => {
      try {
        const user = await fetchUserProfile()
        setProfile(user)
      } catch (err) {
        console.error('Failed to load user profile on dashboard:', err)
      }

      try {
        const docs = await fetchDocumentsApi()
        setDocuments(docs)
      } catch (err) {
        console.error('Failed to load documents on dashboard:', err)
      }

      try {
        const wsData = await fetchWorkspaceData()
        setChatsCount(wsData.chats.length)
      } catch (err) {
        console.error('Failed to load workspace data on dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleToggleLanguage = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi'
    setLang(nextLang)
    localStorage.setItem('govdoc.lang', nextLang)
  }

  const t = translations[lang]

  if (isLoading) {
    return <div className={`page ${styles.shell}`} style={{ display: 'grid', placeItems: 'center' }} />
  }

  return (
    <div className={`page ${styles.shell}`} style={{ background: '#f8fafc' }}>
      <WorkspaceTopbar
        onGoHome={() => navigate('/')}
        isSidebarHidden={true}
        onToggleSidebar={() => {}}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
      />

      <main style={mainContentStyle}>
        <div style={welcomeBannerStyle}>
          <h2>
            {lang === 'vi'
              ? `Chào mừng trở lại, ${profile?.full_name || profile?.username || 'Bạn'}!`
              : `Welcome back, ${profile?.full_name || profile?.username || 'User'}!`}
          </h2>
          <p>
            {lang === 'vi'
              ? 'Hệ thống Phân tích & Hỗ trợ tìm kiếm Văn bản pháp luật thông minh GovDoc'
              : 'GovDoc Intellisense - Intelligent Legal Document Retrieval and Analysis Platform'}
          </p>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={{ ...iconWrapperStyle, background: 'rgba(0, 104, 95, 0.08)', color: '#00685f' }}>
              <span className="material-symbols-outlined">folder</span>
            </div>
            <div>
              <p style={statLabelStyle}>{t.docLibrary}</p>
              <h3 style={statValStyle}>
                {documents.length} <span style={{ fontSize: '0.88rem', color: '#64748b' }}>{t.doc.toLowerCase()}</span>
              </h3>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconWrapperStyle, background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
            <div>
              <p style={statLabelStyle}>{t.recentChats}</p>
              <h3 style={statValStyle}>
                {chatsCount} <span style={{ fontSize: '0.88rem', color: '#64748b' }}>{lang === 'vi' ? 'hội thoại' : 'chats'}</span>
              </h3>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconWrapperStyle, background: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <div>
              <p style={statLabelStyle}>{lang === 'vi' ? 'Hệ số tương thích' : 'Compliance Score'}</p>
              <h3 style={statValStyle}>94%</h3>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{ ...iconWrapperStyle, background: 'rgba(13, 148, 136, 0.08)', color: '#0d9488' }}>
              <span className="material-symbols-outlined">sensors</span>
            </div>
            <div>
              <p style={statLabelStyle}>{lang === 'vi' ? 'Trạng thái API' : 'API Engine'}</p>
              <h3 style={{ ...statValStyle, fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={activeDotStyle} /> Online
              </h3>
            </div>
          </div>
        </div>

        <div style={actionsSectionStyle}>
          <div style={shortcutCardStyle} onClick={() => navigate('/workspace')}>
            <span className="material-symbols-outlined" style={shortcutIconStyle}>
              workspace_premium
            </span>
            <h4>{lang === 'vi' ? 'Không gian làm việc' : 'Workspace'}</h4>
            <p>
              {lang === 'vi'
                ? 'Hỏi đáp pháp lý RAG, phân tích văn bản chuyên nghiệp.'
                : 'Interactive RAG chat, read and parse government files.'}
            </p>
          </div>

          <div style={shortcutCardStyle} onClick={() => navigate('/libraries')}>
            <span className="material-symbols-outlined" style={shortcutIconStyle}>
              local_library
            </span>
            <h4>{lang === 'vi' ? 'Thư viện thông minh' : 'Smart Library'}</h4>
            <p>
              {lang === 'vi'
                ? 'Duyệt danh mục tài liệu phân loại thông minh.'
                : 'Browse classified document library metadata.'}
            </p>
          </div>

          <div style={shortcutCardStyle} onClick={() => navigate('/analytics')}>
            <span className="material-symbols-outlined" style={shortcutIconStyle}>
              insights
            </span>
            <h4>{lang === 'vi' ? 'Phân tích & Thống kê' : 'Insights & Analytics'}</h4>
            <p>
              {lang === 'vi'
                ? 'Trực quan hóa mức độ rủi ro, dòng thời gian tuân thủ.'
                : 'Visualize legal risks, obligations, and timelines.'}
            </p>
          </div>
        </div>

        <div style={recentDocsSectionStyle}>
          <h4 style={sectionTitleStyle}>{lang === 'vi' ? 'Tài liệu gần đây' : 'Recent Documents'}</h4>
          <div style={docListWrapStyle}>
            {documents.slice(0, 4).map((doc) => (
              <div key={doc.id} style={docRowStyle} onClick={() => navigate('/workspace')}>
                <div style={{ color: '#ef4444', display: 'grid', placeItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>
                    picture_as_pdf
                  </span>
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <strong style={docNameStyle} title={doc.fileName}>
                    {doc.fileName}
                  </strong>
                  <small style={docMetaStyle}>
                    {doc.filePages ? `${doc.filePages} ${t.pages}` : 'Pages: N/A'} • {doc.createdAt}
                  </small>
                </div>
                <button type="button" style={openBtnStyle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                    open_in_new
                  </span>
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <div style={emptyDocsStyle}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}>
                  folder_open
                </span>
                <p>{t.emptyDocs}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  padding: '2rem',
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  overflowY: 'auto',
}

const welcomeBannerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #004d40 0%, #00796b 100%)',
  borderRadius: '1rem',
  padding: '2.5rem 2rem',
  color: '#ffffff',
  boxShadow: '0 8px 24px rgba(0, 77, 64, 0.15)',
}


const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.25rem',
}

const statCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.85rem',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
}

const iconWrapperStyle: React.CSSProperties = {
  width: '3.2rem',
  height: '3.2rem',
  borderRadius: '0.6rem',
  display: 'grid',
  placeItems: 'center',
}

const statLabelStyle: React.CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '0.72rem',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: '700',
}

const statValStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '1.35rem',
  fontWeight: '700',
  color: '#1e293b',
}

const activeDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
}

const actionsSectionStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.5rem',
}

const shortcutCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  borderRadius: '1rem',
  padding: '2rem 1.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
  display: 'flex',
  flexDirection: 'column',
}

const shortcutIconStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  color: '#00685f',
  marginBottom: '1rem',
}

const recentDocsSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#1e293b',
}

const docListWrapStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
}

const docRowStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  padding: '0.85rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
}

const docNameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.88rem',
  color: '#1e293b',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '600px',
}

const docMetaStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  color: '#94a3b8',
  marginTop: '0.15rem',
}

const openBtnStyle: React.CSSProperties = {
  border: '0',
  background: 'transparent',
  color: '#00685f',
  cursor: 'pointer',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
}

const emptyDocsStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem 0',
  color: '#94a3b8',
  fontSize: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
}
