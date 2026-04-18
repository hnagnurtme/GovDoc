import { workspaceMockData } from '../mockdata/workspaceMockData'
import type { Message, ReasoningLevel, WorkspaceData } from '../types/workspace'
import { delay } from '../utils/async'
import { makeId } from '../utils/id'

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

export async function simulateUploadDocument(): Promise<{ pages: number }> {
  await delay(700)
  return { pages: Math.floor(Math.random() * 15) + 6 }
}
