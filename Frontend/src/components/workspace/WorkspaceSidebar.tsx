import type { ChangeEvent } from 'react'
import type { ChatFolder, ChatItem, UploadStatus } from '@/types/workspace'
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
}: WorkspaceSidebarProps) {
  return (
    <aside className={isHidden ? `${styles.sidebar} ${styles.sidebarHidden}` : styles.sidebar}>
      <button type="button" className={styles.newChat} onClick={onNewChat}>
        <span className="material-symbols-outlined">add</span>
        New Chat
      </button>

      <div className={styles.sidebarUpload}>
        <label className={styles.uploadBox} htmlFor="pdf-file">
          <input id="pdf-file" type="file" accept="application/pdf" onChange={onPickFile} />
          <strong>Upload PDF</strong>
          <small>Drag and drop PDF or click to select</small>
        </label>

        <div className={styles.uploadFields}>
          <button type="button" className="btn btn-primary" onClick={onUpload}>
            Upload and analyze
          </button>
        </div>

        <p className={styles.uploadStatus}>
          {uploadStatus === 'idle' && 'Waiting for upload'}
          {uploadStatus === 'uploading' && 'Uploading and processing...'}
          {uploadStatus === 'success' && 'Upload completed successfully'}
          {uploadStatus === 'error' && 'Upload failed. Please retry'}
        </p>
      </div>

      {uploadStatus === 'success' && fileName !== 'No file uploaded' && (
        <div className={styles.sourceCard}>
          <p className={styles.sectionTitle}>Source</p>
          <div className={styles.sourceItem}>
            <span className="material-symbols-outlined">description</span>
            <div>
              <strong>{fileName}</strong>
              <small>{filePages ? `${filePages} pages` : 'Pages: N/A'}</small>
            </div>
          </div>
          {fileUrl && (
            <a className={styles.sourceLink} href={fileUrl} target="_blank" rel="noreferrer">
              Open source file
            </a>
          )}
        </div>
      )}

      <div className={styles.sidebarSection}>
        <p className={styles.sectionTitle}>Knowledge Base</p>
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
        <p className={styles.sectionTitle}>Recent Chats</p>
        <input
          className={styles.search}
          type="search"
          placeholder="Search chat"
          value={historyFilter}
          onChange={(event) => onSearch(event.target.value)}
        />
        <div className={styles.recentList}>
          {visibleRecentChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={chat.id === activeChatId ? `${styles.recentItem} ${styles.recentItemActive}` : styles.recentItem}
              onClick={() => onSelectChat(chat.id)}
            >
              <span>{chat.title}</span>
              <small>{chat.updatedAt}</small>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
