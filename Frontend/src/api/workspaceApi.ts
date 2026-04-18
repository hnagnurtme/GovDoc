import { workspaceMockData } from '@/mockdata/workspaceMockData'
import type { Message, ReasoningLevel, WorkspaceData } from '@/types/workspace'
import { delay } from '@/utils/async'
import { makeId } from '@/utils/id'

export async function fetchWorkspaceData(): Promise<WorkspaceData> {
  await delay(220)
  return structuredClone(workspaceMockData)
}

export async function requestAssistantReply(prompt: string, _reasoning: ReasoningLevel): Promise<Message> {
  const backendApiBase = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1'
  const response = await fetch(`${backendApiBase}/chat/simple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Simple chat failed (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { answer?: string }

  return {
    id: makeId('m-assistant'),
    role: 'assistant',
    content: data.answer?.trim() || `No response returned for: "${prompt}"`,
    citations: [],
  }
}

type CloudinaryUploadResponse = {
  secure_url: string
  pages?: number
  original_filename?: string
  public_id?: string
  preview_image_url?: string
}

export type UploadedPdf = {
  secureUrl: string
  pages: number | null
  originalFilename: string | null
  publicId: string | null
  previewImageUrl: string | null
}

export async function uploadPdfToCloudinary(file: File): Promise<UploadedPdf> {
  const backendApiBase = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1'
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${backendApiBase}/cloudinary/upload`, {
    method: 'POST',
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
  }
}
