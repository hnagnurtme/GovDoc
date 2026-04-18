import { useMemo } from 'react'
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

  return (
    <div className={`page ${styles.shell}`}>
      <WorkspaceTopbar onGoHome={() => navigate('/')} />

      <div className={styles.layout}>
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
        />

        <WorkspaceDocumentPanel
          documentTitle={state.documentTitle}
          fileName={state.fileName}
          filePages={state.filePages}
          fileUrl={state.fileUrl}
          uploadTimeText={uploadTimeText}
        />
      </div>
    </div>
  )
}
