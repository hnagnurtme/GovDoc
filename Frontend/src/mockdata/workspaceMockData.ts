import type { WorkspaceData } from '@/types/workspace'

export const workspaceMockData: WorkspaceData = {
  workspaceName: 'Workspace',
  documentTitle: 'Municipal Bylaw No. 2024-15',
  folders: [
    { id: 'labor', name: 'Labor Law', chatIds: ['c1', 'c4'] },
    { id: 'civil', name: 'Civil Law', chatIds: ['c2'] },
    { id: 'criminal', name: 'Criminal Law', chatIds: ['c3'] },
    { id: 'contracts', name: 'Contracts', chatIds: [] },
  ],
  chats: [
    { id: 'c1', title: 'Employee contract termination', updatedAt: '10:25', folderId: 'labor' },
    { id: 'c2', title: 'Property ownership basics', updatedAt: 'Yesterday', folderId: 'civil' },
    { id: 'c3', title: 'Criminal liability overview', updatedAt: '2 days ago', folderId: 'criminal' },
    { id: 'c4', title: 'Overtime payment rights', updatedAt: '3 days ago', folderId: 'labor' },
  ],
  messagesByChat: {
    c1: [
      {
        id: 'm1',
        role: 'assistant',
        content:
          'Welcome to GovDoc Intellisense. Ask a legal question after uploading a relevant document for better grounded answers.',
      },
    ],
    c2: [
      {
        id: 'm2',
        role: 'assistant',
        content:
          'This conversation covers civil law topics. You can ask about ownership, contract validity, and obligations.',
      },
    ],
    c3: [
      {
        id: 'm3',
        role: 'assistant',
        content:
          'This conversation focuses on criminal law. Ask concise questions for faster retrieval and clearer references.',
      },
    ],
    c4: [
      {
        id: 'm4',
        role: 'assistant',
        content:
          'Overtime and labor compliance topics are ready. You can start with employee rights or employer obligations.',
      },
    ],
  },
  quickPrompts: [
    'Summarize obligations in this document',
    'List key legal risks',
    'Extract relevant labor law references',
  ],
  domainOptions: ['All', 'lao_dong', 'dan_su', 'hinh_su', 'hanh_chinh'],
}
