export type MessageRole = 'user' | 'assistant'
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
export type ReasoningLevel = 'low' | 'medium' | 'high'

export type ChatFolder = {
  id: string
  name: string
  chatIds: string[]
}

export type ChatItem = {
  id: string
  title: string
  updatedAt: string
  folderId: string
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  citations?: string[]
  createdAt?: string
}

export type WorkspaceData = {
  workspaceName: string
  documentTitle: string
  folders: ChatFolder[]
  chats: ChatItem[]
  messagesByChat: Record<string, Message[]>
  quickPrompts: string[]
  domainOptions: string[]
}
