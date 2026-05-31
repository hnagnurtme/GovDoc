import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import type { ChatFolder, ChatItem, UploadStatus, StoredDocument } from '@/types/workspace'
import { translations } from '@/utils/translations'
import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceSidebarProps = {
  activeFolderId?: string
  visibleFolders: ChatFolder[]
  visibleRecentChats: ChatItem[]
  expandedFolders: Record<string, boolean>
  historyFilter: string
  uploadStatus: UploadStatus
  onSearch: (value: string) => void
  onToggleFolder: (folderId: string) => void
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  activeChatId: string
  chatTitlesById: Record<string, string>
  fileName: string
  filePages: number | null
  fileUrl: string
  isHidden: boolean
  documents: StoredDocument[]
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onDeleteDocument: (docId: string) => void
  onAttachDocument: (doc: StoredDocument) => void
  lang: 'vi' | 'en'
}

function groupChatsByDate(chats: ChatItem[]) {
  const today: ChatItem[] = []
  const yesterday: ChatItem[] = []
  const older: ChatItem[] = []

  chats.forEach((chat) => {
    const updated = chat.updatedAt.toLowerCase()
    if (
      updated.includes('today') ||
      updated.includes(':') ||
      updated.includes('now') ||
      updated.includes('phút') ||
      updated.includes('giờ')
    ) {
      today.push(chat)
    } else if (updated.includes('yesterday') || updated.includes('qua')) {
      yesterday.push(chat)
    } else {
      older.push(chat)
    }
  })
  return { today, yesterday, older }
}

export function WorkspaceSidebar({
  activeFolderId,
  visibleFolders,
  visibleRecentChats,
  expandedFolders,
  historyFilter,
  uploadStatus,
  onSearch,
  onToggleFolder,
  onSelectChat,
  onNewChat,
  onPickFile,
  onUpload,
  activeChatId,
  chatTitlesById,
  fileName,
  filePages,
  fileUrl,
  isHidden,
  documents,
  onDeleteChat,
  onRenameChat,
  onDeleteDocument,
  onAttachDocument,
  lang,
}: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'files'>('chats')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')

  const t = translations[lang]

  const handleStartRename = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingChatId(chatId)
    setRenameTitle(currentTitle)
  }

  const handleSaveRename = (chatId: string) => {
    if (renameTitle.trim()) {
      onRenameChat(chatId, renameTitle.trim())
    }
    setEditingChatId(null)
  }

  const handleRenameKeyDown = (chatId: string, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveRename(chatId)
    } else if (e.key === 'Escape') {
      setEditingChatId(null)
    }
  }

  // Filter documents by search keyword
  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(historyFilter.toLowerCase())
  )

  const chatGroups = groupChatsByDate(visibleRecentChats)

  const renderChatRow = (chat: ChatItem) => {
    const isActive = chat.id === activeChatId
    const isEditing = editingChatId === chat.id

    if (isEditing) {
      return (
        <div key={chat.id} className={styles.renameRow} onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            className={styles.renameInput}
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => handleRenameKeyDown(chat.id, e)}
            autoFocus
          />
          <button type="button" className={styles.saveBtn} onClick={() => handleSaveRename(chat.id)} aria-label={t.save}>
            <span className="material-symbols-outlined">check</span>
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => setEditingChatId(null)} aria-label={t.cancel}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )
    }

    return (
      <div
        key={chat.id}
        className={isActive ? `${styles.recentItem} ${styles.recentItemActive}` : styles.recentItem}
        onClick={() => onSelectChat(chat.id)}
      >
        <div className={styles.chatTitleSection}>
          <span className={`material-symbols-outlined ${styles.chatBubbleIcon}`}>chat_bubble</span>
          <span>{chat.title}</span>
        </div>
        <div className={styles.chatActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={(e) => handleStartRename(chat.id, chat.title, e)}
            title={t.renameChat}
            aria-label="Rename"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteChat(chat.id)
            }}
            title={t.deleteChat}
            aria-label="Delete"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
        <small className={styles.chatTime}>{chat.updatedAt}</small>
      </div>
    )
  }

  return (
    <aside className={isHidden ? `${styles.sidebar} ${styles.sidebarHidden}` : styles.sidebar}>
      <button type="button" className={styles.newChat} onClick={onNewChat}>
        <span className="material-symbols-outlined">add</span>
        {t.newChat}
      </button>

      <div className={styles.tabContainer}>
        <button
          type="button"
          className={activeTab === 'chats' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
          onClick={() => setActiveTab('chats')}
        >
          <span className="material-symbols-outlined">chat</span>
          {lang === 'vi' ? 'Hội thoại' : 'Chats'}
        </button>
        <button
          type="button"
          className={activeTab === 'files' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
          onClick={() => setActiveTab('files')}
        >
          <span className="material-symbols-outlined">folder</span>
          {lang === 'vi' ? 'Tài liệu' : 'Files'} ({documents.length})
        </button>
      </div>

      {activeTab === 'chats' ? (
        <>
          <div className={styles.sidebarUpload}>
            <label className={styles.uploadBox} htmlFor="pdf-file">
              <input id="pdf-file" type="file" accept="application/pdf" onChange={onPickFile} />
              <strong>{t.uploadPdf}</strong>
              <small>{t.dragDrop}</small>
            </label>

            <div className={styles.uploadFields}>
              <button type="button" className="btn btn-primary" onClick={onUpload}>
                {t.uploadAnalyze}
              </button>
            </div>

            <p className={styles.uploadStatus}>
              {uploadStatus === 'idle' && t.waitingUpload}
              {uploadStatus === 'uploading' && t.uploading}
              {uploadStatus === 'success' && t.uploadSuccess}
              {uploadStatus === 'error' && t.uploadError}
            </p>
          </div>

          {uploadStatus === 'success' && fileName !== 'No file uploaded' && (
            <div className={styles.sourceCard}>
              <p className={styles.sectionTitle}>{t.source}</p>
              <div className={styles.sourceItem}>
                <span className="material-symbols-outlined">description</span>
                <div>
                  <strong>{fileName}</strong>
                  <small>{filePages ? `${filePages} ${t.pages}` : 'Pages: N/A'}</small>
                </div>
              </div>
              {fileUrl && (
                <a className={styles.sourceLink} href={fileUrl} target="_blank" rel="noreferrer">
                  {t.openSource}
                </a>
              )}
            </div>
          )}

          <div className={styles.sidebarSection}>
            <p className={styles.sectionTitle}>{t.knowledgeBase}</p>
            <ul className={styles.folderList}>
              {visibleFolders.map((folder) => {
                const isActiveFolder = activeFolderId === folder.id
                return (
                  <li key={folder.id}>
                    <button
                      type="button"
                      className={isActiveFolder ? `${styles.folderRow} ${styles.folderRowActive}` : styles.folderRow}
                      onClick={() => onToggleFolder(folder.id)}
                    >
                      <span className="material-symbols-outlined">folder</span>
                      <span>{folder.name}</span>
                    </button>
                    {expandedFolders[folder.id] && folder.chatIds.length > 0 && (
                      <div className={styles.folderChats}>
                        {folder.chatIds.map((chatId) => (
                          <button
                            key={chatId}
                            type="button"
                            className={chatId === activeChatId ? `${styles.chatLink} ${styles.chatLinkActive}` : styles.chatLink}
                            onClick={() => onSelectChat(chatId)}
                          >
                            {chatTitlesById[chatId] ?? chatId}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={`${styles.sidebarSection} ${styles.sidebarGrow}`}>
            <p className={styles.sectionTitle}>{t.recentChats}</p>
            <input
              className={styles.search}
              type="search"
              placeholder={t.searchChat}
              value={historyFilter}
              onChange={(event) => onSearch(event.target.value)}
            />
            <div className={styles.recentList}>
              {chatGroups.today.length > 0 && (
                <div className={styles.dateGroup}>
                  <div className={styles.dateHeader}>{t.today}</div>
                  {chatGroups.today.map(renderChatRow)}
                </div>
              )}
              {chatGroups.yesterday.length > 0 && (
                <div className={styles.dateGroup}>
                  <div className={styles.dateHeader}>{t.yesterday}</div>
                  {chatGroups.yesterday.map(renderChatRow)}
                </div>
              )}
              {chatGroups.older.length > 0 && (
                <div className={styles.dateGroup}>
                  <div className={styles.dateHeader}>{t.older}</div>
                  {chatGroups.older.map(renderChatRow)}
                </div>
              )}
              {visibleRecentChats.length === 0 && (
                <div className={styles.emptyState}>{t.emptyChats}</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={`${styles.sidebarSection} ${styles.sidebarGrow} ${styles.filesTab}`}>
          <p className={styles.sectionTitle}>{t.docLibrary}</p>
          <input
            className={styles.search}
            type="search"
            placeholder={t.searchDoc}
            value={historyFilter}
            onChange={(event) => onSearch(event.target.value)}
          />
          <div className={styles.fileList}>
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className={styles.fileRow}>
                <div className={styles.fileIcon}>
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                </div>
                <div className={styles.fileDetailsShort}>
                  <strong title={doc.fileName}>{doc.fileName}</strong>
                  <small>
                    {doc.filePages ? `${doc.filePages} ${t.pages}` : 'Pages: N/A'} • {doc.createdAt}
                  </small>
                </div>
                <div className={styles.fileActions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onAttachDocument(doc)}
                    title={t.attachChat}
                    aria-label="Attach to chat"
                  >
                    <span className="material-symbols-outlined">link</span>
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onDeleteDocument(doc.id)}
                    title={t.deleteDoc}
                    aria-label="Delete document"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredDocuments.length === 0 && (
              <div className={styles.emptyState}>{t.emptyDocs}</div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
