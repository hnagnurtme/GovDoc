import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { 
  fetchWorkspaceData, 
  requestAssistantReply, 
  uploadPdfToCloudinary,
  createChatApi,
  fetchChatMessages,
  deleteChatApi,
  fetchDocumentsApi,
  deleteDocumentApi,
  updateChatApi,
  linkDocumentApi,
} from '@/api/workspaceApi'
import type { ChatItem, ChatFolder, Message, ReasoningLevel, UploadStatus, StoredUploadedPdf, StoredDocument } from '@/types/workspace'
import { makeId } from '@/utils/id'
import { nowLabel } from '@/utils/time'

const DEFAULT_EXPANDED: Record<string, boolean> = {
  labor: true,
  civil: true,
  criminal: true,
  contracts: true,
}

export function useWorkspaceState() {
  const [workspaceName, setWorkspaceName] = useState('Workspace')
  const [documentTitle, setDocumentTitle] = useState('Municipal Bylaw No. 2024-15')
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({})
  const [documentsByChat, setDocumentsByChat] = useState<Record<string, StoredUploadedPdf>>({})
  const [quickPrompts, setQuickPrompts] = useState<string[]>([])
  const [domainOptions, setDomainOptions] = useState<string[]>(['All'])
  const [activeChatId, setActiveChatId] = useState('')
  const [historyFilter, setHistoryFilter] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(DEFAULT_EXPANDED)
  const [composerText, setComposerText] = useState('')
  const [domain, setDomain] = useState('All')
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>('medium')
  const [showReasoningMenu, setShowReasoningMenu] = useState(false)
  const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('No file uploaded')
  const [filePages, setFilePages] = useState<number | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [fileSummary, setFileSummary] = useState<string | null>(null)
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const clientId = useMemo(() => makeId('client'), [])
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [pipelineProgress, setPipelineProgress] = useState<Record<string, { status: 'pending' | 'running' | 'completed' | 'error', error?: string }>>({
    upload: { status: 'pending' },
    scan: { status: 'pending' },
    summarize: { status: 'pending' },
    chunk: { status: 'pending' },
    embed: { status: 'pending' },
    store: { status: 'pending' },
  })
  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'vi' ? 'en' : 'vi'))
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  // Track which chatIds have had messages loaded to avoid duplicate fetches
  const loadedChatIds = useRef<Set<string>>(new Set())

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch workspace layout on initial load
  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchWorkspaceData()
        setWorkspaceName(data.workspaceName)
        setDocumentTitle(data.documentTitle)
        setFolders(data.folders)
        setChats(data.chats)
        setMessagesByChat(data.messagesByChat)
        setQuickPrompts(data.quickPrompts)
        setDomainOptions(data.domainOptions)
        setDocumentsByChat(data.documentsByChat || {})
        
        const initialChatId = data.chats[0]?.id ?? ''
        setActiveChatId(initialChatId)
        
        try {
          const docs = await fetchDocumentsApi()
          setDocuments(docs)
        } catch (docErr) {
          console.error('Failed to fetch documents list:', docErr)
        }
      } catch (err) {
        console.error('Failed to load workspace data from backend:', err)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])


  // Sync document panel state when active chat changes
  useEffect(() => {
    if (!activeChatId) return

    const activeDoc = documentsByChat[activeChatId]
    if (activeDoc) {
      setFileName(activeDoc.fileName)
      setFilePages(activeDoc.filePages)
      setFileUrl(activeDoc.fileUrl)
      setPreviewImageUrl(activeDoc.previewImageUrl)
      setFileSummary(activeDoc.summary)
      setDocumentTitle(activeDoc.fileName)
      setUploadStatus('success')
    } else {
      setFileName('No file uploaded')
      setFilePages(null)
      setFileUrl('')
      setPreviewImageUrl('')
      setFileSummary(null)
      setDocumentTitle(workspaceName)
      setUploadStatus('idle')
    }
  }, [activeChatId, documentsByChat, workspaceName])

  const activeMessages = useMemo(() => messagesByChat[activeChatId] ?? [], [messagesByChat, activeChatId])
  const activeChat = useMemo(() => chats.find((chat) => chat.id === activeChatId), [chats, activeChatId])

  // Lazy-load messages when switching chats (only fetch once per chat session)
  useEffect(() => {
    if (!activeChatId || loadedChatIds.current.has(activeChatId)) return
    loadedChatIds.current.add(activeChatId)

    void (async () => {
      setIsLoadingMessages(true)
      try {
        const messages = await fetchChatMessages(activeChatId)
        setMessagesByChat((prev) => ({ ...prev, [activeChatId]: messages }))
      } catch (err) {
        console.error('Failed to load messages for chat', activeChatId, err)
      } finally {
        setIsLoadingMessages(false)
      }
    })()
  }, [activeChatId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const filteredChats = useMemo(() => {
    const q = historyFilter.trim().toLowerCase()
    if (!q) {
      return chats
    }
    return chats.filter((chat) => chat.title.toLowerCase().includes(q))
  }, [chats, historyFilter])

  const visibleFolders = useMemo(() => folders, [folders])
  const visibleRecentChats = useMemo(() => filteredChats, [filteredChats])

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }, [])

  const startNewChat = useCallback(async () => {
    const id = makeId('chat')
    const title = 'New conversation'
    const folderId = 'contracts'

    try {
      await createChatApi(id, title, folderId)
    } catch (err) {
      console.error('Failed to persist new chat in database:', err)
      return
    }

    const newChat: ChatItem = {
      id,
      title,
      updatedAt: 'Just now',
      folderId,
    }

    setChats((prev) => [newChat, ...prev])
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, chatIds: [id, ...folder.chatIds] } : folder,
      ),
    )
    setMessagesByChat((prev) => ({
      ...prev,
      [id]: [
        {
          id: makeId('m-assistant'),
          role: 'assistant',
          createdAt: nowLabel(),
          content: 'Conversation started. Upload a PDF and ask your question.',
        },
      ],
    }))
    setActiveChatId(id)
  }, [])

  const sendMessage = useCallback(async () => {
    const text = composerText.trim()
    if (!text || !activeChatId) {
      return
    }

    const userMessage: Message = {
      id: makeId('m-user'),
      role: 'user',
      content: text,
      createdAt: nowLabel(),
    }

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), userMessage],
    }))

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, title: text.slice(0, 48), updatedAt: nowLabel() } : chat,
      ),
    )
    setComposerText('')
    setShowReasoningMenu(false)

    let normalizedAssistantMessage: Message
    setIsAwaitingAssistant(true)
    try {
      const history = activeMessages.map((m) => ({ role: m.role, content: m.content }))
      // Pass the activeChatId to save in database
      const assistantMessage = await requestAssistantReply(text, reasoningLevel, history, fileSummary, activeChatId)
      normalizedAssistantMessage = {
        ...assistantMessage,
        createdAt: assistantMessage.createdAt ?? nowLabel(),
      }
    } catch {
      normalizedAssistantMessage = {
        id: makeId('m-assistant'),
        role: 'assistant',
        content: 'Failed to retrieve response from assistant. Please try again.',
        createdAt: nowLabel(),
      }
    } finally {
      setIsAwaitingAssistant(false)
    }

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), normalizedAssistantMessage],
    }))
  }, [composerText, activeChatId, reasoningLevel, activeMessages, fileSummary])

  const handleComposerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void sendMessage()
      }
    },
    [sendMessage],
  )

  const triggerUpload = useCallback(async () => {
    if (!selectedFile || !activeChatId) {
      setUploadStatus('error')
      return
    }

    // Reset progress
    setPipelineProgress({
      upload: { status: 'pending' },
      scan: { status: 'pending' },
      summarize: { status: 'pending' },
      chunk: { status: 'pending' },
      embed: { status: 'pending' },
      store: { status: 'pending' },
    })

    const wsBase = (import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
    const ws = new WebSocket(`${wsBase}/ws/progress/${clientId}`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { step: string; status: 'pending' | 'running' | 'completed' | 'error'; error?: string }
        setPipelineProgress((prev) => ({
          ...prev,
          [data.step]: { status: data.status, error: data.error },
        }))
        if (data.status === 'error') {
          setUploadStatus('error')
          ws.close()
        }
      } catch (err) {
        console.error('Failed to parse WebSocket progress:', err)
      }
    }

    try {
      setUploadStatus('uploading')
      // Pass the activeChatId and clientId to link the uploaded document to this chat
      const result = await uploadPdfToCloudinary(selectedFile, activeChatId, clientId)
      setUploadStatus('success')
      setFilePages(result.pages)
      setFileUrl(result.secureUrl)
      setPreviewImageUrl(result.previewImageUrl ?? '')
      setFileSummary(result.summary)
      const resolvedFileName = result.originalFilename || selectedFile.name
      setFileName(resolvedFileName)
      setDocumentTitle(resolvedFileName)

      // Save document status locally in state mapping
      const newDoc: StoredUploadedPdf = {
        fileName: resolvedFileName,
        filePages: result.pages ?? null,
        fileUrl: result.secureUrl,
        previewImageUrl: result.previewImageUrl ?? '',
        summary: result.summary,
      }
      setDocumentsByChat((prev) => ({
        ...prev,
        [activeChatId]: newDoc,
      }))

      // Refetch documents to include the new one in the list
      try {
        const docs = await fetchDocumentsApi()
        setDocuments(docs)
      } catch (docErr) {
        console.error('Failed to fetch documents list after upload:', docErr)
      }
    } catch (error) {
      console.error(error)
      setUploadStatus('error')
    } finally {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }, 1000)
    }
  }, [selectedFile, activeChatId, clientId])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChatApi(chatId)
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      setFolders((prev) =>
        prev.map((folder) => ({
          ...folder,
          chatIds: folder.chatIds.filter((id) => id !== chatId),
        }))
      )
      if (activeChatId === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId)
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id)
        } else {
          setActiveChatId('')
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err)
    }
  }, [activeChatId, chats])

  const renameChat = useCallback(async (chatId: string, newTitle: string) => {
    try {
      await updateChatApi(chatId, newTitle)
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      )
    } catch (err) {
      console.error('Failed to rename chat:', err)
    }
  }, [])

  const deleteDocument = useCallback(async (docId: string) => {
    try {
      await deleteDocumentApi(docId)
      const docToDelete = documents.find((d) => d.id === docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      
      setDocumentsByChat((prev) => {
        const next = { ...prev }
        for (const cid in next) {
          if (docToDelete && next[cid]?.fileUrl === docToDelete.fileUrl) {
            delete next[cid]
          }
        }
        return next
      })
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }, [documents])

  const attachDocumentToChat = useCallback(async (doc: StoredDocument) => {
    if (!activeChatId) return
    try {
      // Set loading status to simulate linking
      setUploadStatus('uploading')
      
      // Call backend to link document to chat
      await linkDocumentApi(doc.id, activeChatId)
      
      const mappedDoc: StoredUploadedPdf = {
        fileName: doc.fileName,
        filePages: doc.filePages,
        fileUrl: doc.fileUrl,
        previewImageUrl: doc.previewImageUrl || '',
        summary: doc.summary,
      }
      setDocumentsByChat((prev) => ({
        ...prev,
        [activeChatId]: mappedDoc
      }))
      
      // Update locally in documents list which chatId it belongs to
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, chatId: activeChatId } : d))
      )
      
      // Set to success
      setUploadStatus('success')
      setFileName(doc.fileName)
      setFilePages(doc.filePages)
      setFileUrl(doc.fileUrl)
      setPreviewImageUrl(doc.previewImageUrl || '')
      setFileSummary(doc.summary)
      setDocumentTitle(doc.fileName)
    } catch (err) {
      console.error('Failed to link document:', err)
      setUploadStatus('error')
    }
  }, [activeChatId])

  const onPickFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }
      setSelectedFile(file)
      setFileName(file.name)
      setFilePages(null)
      setFileUrl('')
      setPreviewImageUrl('')
      setUploadStatus('idle')
    },
    [],
  )

  return {
    workspaceName,
    documentTitle,
    folders,
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    expandedFolders,
    toggleFolder,
    visibleFolders,
    visibleRecentChats,
    historyFilter,
    setHistoryFilter,
    activeMessages,
    messageEndRef,
    quickPrompts,
    composerText,
    setComposerText,
    sendMessage,
    handleComposerKeyDown,
    domain,
    setDomain,
    domainOptions,
    reasoningLevel,
    setReasoningLevel,
    showReasoningMenu,
    setShowReasoningMenu,
    isAwaitingAssistant,
    uploadStatus,
    fileName,
    filePages,
    fileUrl,
    previewImageUrl,
    fileSummary,
    onPickFile,
    triggerUpload,
    startNewChat,
    isLoading,
    isLoadingMessages,
    documents,
    deleteChat,
    renameChat,
    deleteDocument,
    attachDocumentToChat,
    clientId,
    lang,
    toggleLanguage,
    pipelineProgress,
  }
}

