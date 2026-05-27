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

export type Citation = {
  article_ref: string | null
  doc_title: string | null
  content: string | null
  score: number
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  citations?: Citation[]
  createdAt?: string
}

export type StoredUploadedPdf = {
  fileName: string
  filePages: number | null
  fileUrl: string
  previewImageUrl: string
  summary: string | null
}

export type WorkspaceData = {
  workspaceName: string
  documentTitle: string
  folders: ChatFolder[]
  chats: ChatItem[]
  messagesByChat: Record<string, Message[]>
  documentsByChat?: Record<string, StoredUploadedPdf>
  quickPrompts: string[]
  domainOptions: string[]
  summary?: string
}
