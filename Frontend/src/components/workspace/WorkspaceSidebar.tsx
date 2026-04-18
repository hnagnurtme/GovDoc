import type { ChangeEvent } from 'react'
import type { ChatFolder, ChatItem, UploadStatus } from '../../types/workspace'

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
}: WorkspaceSidebarProps) {
  return (
    <aside className="ws-sidebar">
      <button type="button" className="ws-new-chat" onClick={onNewChat}>
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
          <button type="button" className="btn btn-primary" onClick={onUpload}>
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
            const isActiveFolder = activeFolderId === folder.id
            return (
              <li key={folder.id}>
                <button
                  type="button"
                  className={isActiveFolder ? 'ws-folder-row ws-folder-row-active' : 'ws-folder-row'}
                  onClick={() => onToggleFolder(folder.id)}
                >
                  <span className="material-symbols-outlined">folder</span>
                  <span>{folder.name}</span>
                </button>
                {expandedFolders[folder.id] && folder.chatIds.length > 0 && (
                  <div className="ws-folder-chats">
                    {folder.chatIds.map((chatId) => (
                      <button
                        key={chatId}
                        type="button"
                        className={chatId === activeChatId ? 'ws-chat-link ws-chat-link-active' : 'ws-chat-link'}
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

      <div className="ws-sidebar-section ws-sidebar-grow">
        <p className="ws-section-title">Recent Chats</p>
        <input
          className="ws-search"
          type="search"
          placeholder="Search chat"
          value={historyFilter}
          onChange={(event) => onSearch(event.target.value)}
        />
        <div className="ws-recent-list">
          {visibleRecentChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={chat.id === activeChatId ? 'ws-recent-item ws-recent-item-active' : 'ws-recent-item'}
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
