import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUserProfile, updateUserProfile } from '@/api/auth'
import type { UserProfile } from '@/types/workspace'
import styles from './UserProfilePopup.module.css'

// ── helpers ───────────────────────────────────────────────────────────────────

/** Returns the 1-2 letter initials shown inside the avatar circle */
function getInitials(profile: UserProfile | null): string {
  if (!profile) return '??'
  if (profile.full_name) {
    const parts = profile.full_name.trim().split(/\s+/)
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return profile.username.slice(0, 2).toUpperCase()
}

/** Picks a deterministic teal-spectrum colour from the username if none saved */
const PALETTE = ['#00685f', '#0f766e', '#0d9488', '#059669', '#0284c7', '#7c3aed']
function defaultColor(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

// ── Avatar button (exported separately so Topbar can use it) ─────────────────

type AvatarButtonProps = {
  profile: UserProfile | null
  onClick: () => void
  size?: number
}

export function AvatarButton({ profile, onClick, size = 32 }: AvatarButtonProps) {
  const initials = getInitials(profile)
  const bg = profile?.avatar_color ?? (profile ? defaultColor(profile.username) : '#00685f')

  return (
    <button
      type="button"
      className={styles.avatarBtn}
      style={{ width: size, height: size, background: bg }}
      onClick={onClick}
      aria-label="Open user profile"
      title="Profile"
    >
      {initials}
    </button>
  )
}

// ── Colour swatch picker ──────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  '#00685f', '#0f766e', '#0d9488', '#059669',
  '#0284c7', '#7c3aed', '#be185d', '#b45309',
]

type ColorPickerProps = { value: string; onChange: (c: string) => void }

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className={styles.colorPicker} aria-label="Avatar colour">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          className={value === c ? `${styles.swatch} ${styles.swatchActive}` : styles.swatch}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  )
}

// ── Main popup component ──────────────────────────────────────────────────────

type UserProfilePopupProps = {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
  onProfileUpdate?: (profile: UserProfile) => void
}

export function UserProfilePopup({ isOpen, onClose, anchorRef, onProfileUpdate }: UserProfilePopupProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Edit form local state
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [draftColor, setDraftColor] = useState('#00685f')

  const popupRef = useRef<HTMLDivElement | null>(null)

  // Load profile when popup opens
  useEffect(() => {
    if (!isOpen) return
    fetchUserProfile()
      .then((data) => {
        setProfile(data)
        setDraftName(data.full_name ?? '')
        setDraftEmail(data.email ?? '')
        setDraftBio(data.bio ?? '')
        setDraftColor(data.avatar_color ?? defaultColor(data.username))
      })
      .catch(console.error)
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose, anchorRef])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const updated = await updateUserProfile({
        full_name: draftName || null,
        email: draftEmail || null,
        bio: draftBio || null,
        avatar_color: draftColor,
      })
      setProfile(updated)
      onProfileUpdate?.(updated)
      setIsEditing(false)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [draftName, draftEmail, draftBio, draftColor])

  const handleCancelEdit = useCallback(() => {
    if (!profile) return
    setDraftName(profile.full_name ?? '')
    setDraftEmail(profile.email ?? '')
    setDraftBio(profile.bio ?? '')
    setDraftColor(profile.avatar_color ?? defaultColor(profile.username))
    setSaveError(null)
    setIsEditing(false)
  }, [profile])

  if (!isOpen) return null

  const initials = getInitials(profile)
  const bg = profile?.avatar_color ?? (profile ? defaultColor(profile.username) : '#00685f')
  const displayName = profile?.full_name || profile?.username || '—'

  return (
    <div className={styles.popup} ref={popupRef} role="dialog" aria-label="User profile">
      {/* Header */}
      <div className={styles.popupHeader} style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}08)` }}>
        <div className={styles.popupAvatar} style={{ background: bg }}>
          {initials}
        </div>
        <div className={styles.popupHeaderInfo}>
          <strong className={styles.displayName}>{displayName}</strong>
          <span className={styles.username}>@{profile?.username}</span>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Body */}
      <div className={styles.popupBody}>
        {!isEditing ? (
          // ── View mode ──────────────────────────────────────────────────
          <>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">badge</span>
                <dt>Full name</dt>
                <dd>{profile?.full_name || <em className={styles.empty}>Not set</em>}</dd>
              </div>
              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">mail</span>
                <dt>Email</dt>
                <dd>{profile?.email || <em className={styles.empty}>Not set</em>}</dd>
              </div>
              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">info</span>
                <dt>Bio</dt>
                <dd>{profile?.bio || <em className={styles.empty}>Not set</em>}</dd>
              </div>
              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">calendar_today</span>
                <dt>Member since</dt>
                <dd>{profile?.created_at ?? '—'}</dd>
              </div>
            </dl>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              <span className="material-symbols-outlined">edit</span>
              Edit profile
            </button>
          </>
        ) : (
          // ── Edit mode ──────────────────────────────────────────────────
          <form
            className={styles.editForm}
            onSubmit={(e) => { e.preventDefault(); void handleSave() }}
          >
            <label className={styles.fieldLabel}>
              Full name
              <input
                type="text"
                className={styles.fieldInput}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Your full name"
                maxLength={100}
              />
            </label>
            <label className={styles.fieldLabel}>
              Email
              <input
                type="email"
                className={styles.fieldInput}
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={254}
              />
            </label>
            <label className={styles.fieldLabel}>
              Bio
              <textarea
                className={styles.fieldTextarea}
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="A short bio..."
                maxLength={500}
                rows={3}
              />
            </label>
            <div className={styles.fieldLabel}>
              Avatar colour
              <ColorPicker value={draftColor} onChange={setDraftColor} />
            </div>

            {saveError && <p className={styles.saveError}>{saveError}</p>}

            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
