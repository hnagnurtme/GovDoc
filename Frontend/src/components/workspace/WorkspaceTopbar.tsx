import { useEffect, useRef, useState } from 'react'
import { fetchUserProfile } from '@/api/auth'
import { AvatarButton, UserProfilePopup } from '@/components/workspace/UserProfilePopup'
import type { UserProfile } from '@/types/workspace'
import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceTopbarProps = {
  onGoHome: () => void
  isSidebarHidden: boolean
  onToggleSidebar: () => void
}

export function WorkspaceTopbar({ onGoHome, isSidebarHidden, onToggleSidebar }: WorkspaceTopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  // Ref gắn vào wrapper span để popup dùng cho outside-click detection
  const avatarWrapRef = useRef<HTMLSpanElement | null>(null)

  // Fetch profile ngay khi Topbar mount để avatar hiển thị đúng màu/initials
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
          <span className={styles.topNavActive}>Workspace</span>
          <span>Libraries</span>
          <span>Analytics</span>
        </nav>
      </div>

      <div className={styles.topbarRight}>
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
            import('@/api/auth').then((auth) => {
              auth.logout()
              window.location.reload()
            })
          }}
        >
          <span className="material-symbols-outlined">logout</span>
        </button>

        {/* Wrapper span giữ ref cho outside-click, AvatarButton nhận profile đã fetch */}
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
