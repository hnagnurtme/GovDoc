import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkspaceChatMain } from '@/components/workspace/WorkspaceChatMain'
import { WorkspaceDocumentPanel } from '@/components/workspace/WorkspaceDocumentPanel'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar'
import styles from '@/components/workspace/Workspace.module.css'
import { useWorkspaceState } from '@/hooks/useWorkspaceState'

export function WorkspacePage() {
  const navigate = useNavigate()
  const state = useWorkspaceState()
  const [isSidebarHidden, setIsSidebarHidden] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(450)

  const uploadTimeText = useMemo(
    () => (state.uploadStatus === 'success' ? new Date().toLocaleTimeString() : 'N/A'),
    [state.uploadStatus],
  )

  const chatTitlesById = useMemo(
    () => Object.fromEntries(state.chats.map((chat) => [chat.id, chat.title])),
    [state.chats],
  )

  if (state.isLoading) {
    return <div className={`page ${styles.shell}`} />
  }

  const startResizePreview = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = previewWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX
      const nextWidth = Math.min(780, Math.max(340, startWidth + deltaX))
      setPreviewWidth(nextWidth)
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const layoutStyle = {
    '--sidebar-width': `${isSidebarHidden ? 0 : 288}px`,
    '--preview-width': `${previewWidth}px`,
  } as CSSProperties

  return (
    <div className={`page ${styles.shell}`}>
      <WorkspaceTopbar
        onGoHome={() => navigate('/')}
        isSidebarHidden={isSidebarHidden}
        onToggleSidebar={() => setIsSidebarHidden((prev) => !prev)}
      />

      <div className={styles.layout} style={layoutStyle}>
        <WorkspaceSidebar
          activeFolderId={state.activeChat?.folderId}
          visibleFolders={state.visibleFolders}
          visibleRecentChats={state.visibleRecentChats}
          expandedFolders={state.expandedFolders}
          historyFilter={state.historyFilter}
          uploadStatus={state.uploadStatus}
          onSearch={state.setHistoryFilter}
          onToggleFolder={state.toggleFolder}
          onSelectChat={state.setActiveChatId}
          onNewChat={state.startNewChat}
          onPickFile={state.onPickFile}
          onUpload={() => void state.triggerUpload()}
          activeChatId={state.activeChatId}
          chatTitlesById={chatTitlesById}
          fileName={state.fileName}
          filePages={state.filePages}
          fileUrl={state.fileUrl}
          isHidden={isSidebarHidden}
        />

        <WorkspaceChatMain
          workspaceName={state.workspaceName}
          messages={state.activeMessages}
          messageEndRef={state.messageEndRef}
          quickPrompts={state.quickPrompts}
          composerText={state.composerText}
          domain={state.domain}
          domainOptions={state.domainOptions}
          reasoningLevel={state.reasoningLevel}
          showReasoningMenu={state.showReasoningMenu}
          onDomainChange={state.setDomain}
          onComposerChange={state.setComposerText}
          onComposerKeyDown={state.handleComposerKeyDown}
          onUseQuickPrompt={state.setComposerText}
          onToggleReasoningMenu={() => state.setShowReasoningMenu((prev) => !prev)}
          onChangeReasoning={state.setReasoningLevel}
          onSendMessage={() => void state.sendMessage()}
        />

        <div className={styles.previewResizeHandle} onMouseDown={startResizePreview} role="separator" aria-orientation="vertical" aria-label="Resize preview panel" />

        <WorkspaceDocumentPanel
          documentTitle={state.documentTitle}
          fileName={state.fileName}
          filePages={state.filePages}
          fileUrl={state.fileUrl}
          previewImageUrl={state.previewImageUrl}
          uploadTimeText={uploadTimeText}
        />
      </div>
    </div>
  )
}
