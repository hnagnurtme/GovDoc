import { getToken } from '@/api/auth'
import type { Message, ReasoningLevel, WorkspaceData } from '@/types/workspace'
import { makeId } from '@/utils/id'

function getApiBase() {
  return import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1'
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extraHeaders }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function normalizeAssistantContent(raw: string | undefined, fallbackPrompt: string): string {
  const initial = (raw ?? '').trim()
  if (!initial) {
    return `No response returned for: "${fallbackPrompt}"`
  }

  let text = initial
  const startsWithQuote = text.startsWith('"')
  const endsWithQuote = text.endsWith('"')
  if (startsWithQuote && endsWithQuote) {
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed === 'string') {
        text = parsed
      }
    } catch {
      text = text.slice(1, -1)
    }
  }

  text = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')

  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1)
  }

  return text
}

export async function fetchWorkspaceData(): Promise<WorkspaceData> {
  const response = await fetch(`${getApiBase()}/workspace`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear localStorage and force reload to redirect to login
      localStorage.removeItem('govdoc.token')
      window.location.reload()
    }
    const errorBody = await response.text()
    throw new Error(`Failed to fetch workspace data (${response.status}): ${errorBody}`)
  }

  return (await response.json()) as WorkspaceData
}

export async function requestAssistantReply(
  prompt: string,
  _reasoning: ReasoningLevel,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  summary: string | null = null,
  chatId?: string
): Promise<Message> {
  const response = await fetch(`${getApiBase()}/query`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      question: prompt,
      top_k: 5,
      history: history.map((m) => ({ role: m.role, content: m.content })),
      doc_summary: summary,
      chatId: chatId,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`RAG query failed (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { answer: string; citations: any[] }

  return {
    id: makeId('m-assistant'),
    role: 'assistant',
    content: normalizeAssistantContent(data.answer, prompt),
    citations: data.citations || [],
  }
}

type CloudinaryUploadResponse = {
  secure_url: string
  pages?: number
  original_filename?: string
  public_id?: string
  preview_image_url?: string
  summary?: string
}

export type UploadedPdf = {
  secureUrl: string
  pages: number | null
  originalFilename: string | null
  publicId: string | null
  previewImageUrl: string | null
  summary: string | null
}

export async function uploadPdfToCloudinary(file: File, chatId?: string): Promise<UploadedPdf> {
  const formData = new FormData()
  formData.append('file', file)
  if (chatId) {
    formData.append('chatId', chatId)
  }

  const response = await fetch(`${getApiBase()}/cloudinary/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Cloudinary upload failed (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as CloudinaryUploadResponse
  return {
    secureUrl: data.secure_url,
    pages: data.pages ?? null,
    originalFilename: data.original_filename ?? null,
    publicId: data.public_id ?? null,
    previewImageUrl: data.preview_image_url ?? null,
    summary: data.summary ?? null,
  }
}

// We can also export helper API calls for folders and chats
export async function createFolderApi(id: string, name: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/folders`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id, name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${await response.text()}`)
  }
}

export async function deleteFolderApi(folderId: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/folders/${folderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete folder: ${await response.text()}`)
  }
}

export async function createChatApi(id: string, title: string, folderId?: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/chats`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id, title, folderId }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create chat: ${await response.text()}`)
  }
}

export async function deleteChatApi(chatId: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/chats/${chatId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete chat: ${await response.text()}`)
  }
}

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`${getApiBase()}/chats/${chatId}/messages`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`Failed to load messages (${response.status})`)
  return (await response.json()) as Message[]
}
