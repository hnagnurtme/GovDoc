import { workspaceMockData } from '@/mockdata/workspaceMockData'
import type { Message, ReasoningLevel, WorkspaceData } from '@/types/workspace'
import { delay } from '@/utils/async'
import { makeId } from '@/utils/id'

export async function fetchWorkspaceData(): Promise<WorkspaceData> {
  await delay(220)
  return structuredClone(workspaceMockData)
}

export async function requestAssistantReply(prompt: string, reasoning: ReasoningLevel): Promise<Message> {
  await delay(280)

  return {
    id: makeId('m-assistant'),
    role: 'assistant',
    content:
      `Draft answer (${reasoning.toUpperCase()} depth): for "${prompt}", based on the available context this question should be mapped to relevant Vietnamese legal clauses. Please review cited references before final legal use.`,
    citations: ['Article 35 Labor Code 2019', 'Article 158 Civil Code 2015'],
  }
}

type CloudinaryUploadResponse = {
  secure_url: string
  pages?: number
  original_filename?: string
  public_id?: string
}

export type UploadedPdf = {
  secureUrl: string
  pages: number | null
  originalFilename: string | null
  publicId: string | null
}

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadPdfToCloudinary(file: File): Promise<UploadedPdf> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, VITE_CLOUDINARY_API_SECRET in .env')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `timestamp=${timestamp}${apiSecret}`
  const signature = await sha1Hex(signatureBase)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
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
  }
}
