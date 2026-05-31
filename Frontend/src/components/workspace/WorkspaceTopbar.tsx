import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchUserProfile, logout } from '@/api/auth'
import { AvatarButton, UserProfilePopup } from '@/components/workspace/UserProfilePopup'
import type { UserProfile } from '@/types/workspace'
import { translations } from '@/utils/translations'
import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceTopbarProps = {
  onGoHome: () => void
  isSidebarHidden: boolean
  onToggleSidebar: () => void
  lang: 'vi' | 'en'
  onToggleLanguage: () => void
}

export function WorkspaceTopbar({
  onGoHome,
  isSidebarHidden,
  onToggleSidebar,
  lang,
  onToggleLanguage,
}: WorkspaceTopbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const activePath = location.pathname
  const t = translations[lang]

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const avatarWrapRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    fetchUserProfile().then(setProfile).catch(console.error)
  }, [])

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={isSidebarHidden ? 'Show left sidebar' : 'Hide left sidebar'}
          title={isSidebarHidden ? 'Show left sidebar' : 'Hide left sidebar'}
          onClick={onToggleSidebar}
        >
          <span className="material-symbols-outlined">
            {isSidebarHidden ? 'left_panel_open' : 'left_panel_close'}
          </span>
        </button>
        <button type="button" className={styles.brand} onClick={onGoHome}>
          GovDoc Intellisense
        </button>
        <nav className={styles.topNav} aria-label="Workspace navigation">
          <span
            className={activePath === '/dashboard' ? styles.topNavActive : ''}
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            {t.overview}
          </span>
          <span
            className={activePath === '/workspace' ? styles.topNavActive : ''}
            onClick={() => navigate('/workspace')}
            style={{ cursor: 'pointer' }}
          >
            {t.workspace}
          </span>
          <span
            className={activePath === '/libraries' ? styles.topNavActive : ''}
            onClick={() => navigate('/libraries')}
            style={{ cursor: 'pointer' }}
          >
            {t.libraries}
          </span>
          <span
            className={activePath === '/analytics' ? styles.topNavActive : ''}
            onClick={() => navigate('/analytics')}
            style={{ cursor: 'pointer' }}
          >
            {t.analytics}
          </span>
        </nav>
      </div>

      <div className={styles.topbarRight}>
        <button
          type="button"
          className={styles.iconBtn}
          style={{ display: 'flex', width: 'auto', gap: '0.25rem', padding: '0 0.5rem', fontWeight: 'bold' }}
          onClick={onToggleLanguage}
          title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>language</span>
          <span style={{ fontSize: '0.8rem' }}>{lang.toUpperCase()}</span>
        </button>

        <button type="button" className={styles.iconBtn} aria-label="History">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Help">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Logout"
          title="Sign Out"
          style={{ marginRight: '4px' }}
          onClick={() => {
            logout()
            window.location.reload()
          }}
        >
          <span className="material-symbols-outlined">logout</span>
        </button>

        <span ref={avatarWrapRef} style={{ display: 'inline-flex' }}>
          <AvatarButton
            profile={profile}
            onClick={() => setIsProfileOpen((prev) => !prev)}
            size={32}
          />
        </span>

        <UserProfilePopup
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          anchorRef={avatarWrapRef}
          onProfileUpdate={setProfile}
        />
      </div>
    </header>
  )
}

