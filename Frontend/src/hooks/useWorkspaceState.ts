import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { 
  fetchWorkspaceData, 
  requestAssistantReply, 
  uploadPdfToCloudinary,
  createChatApi
} from '@/api/workspaceApi'
import type { ChatItem, ChatFolder, Message, ReasoningLevel, UploadStatus, StoredUploadedPdf } from '@/types/workspace'
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
  const [isLoading, setIsLoading] = useState(true)

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

  const visibleFolders = useMemo(() => folders.slice(0, 2), [folders])
  const visibleRecentChats = useMemo(() => filteredChats.slice(0, 4), [filteredChats])

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

    try {
      setUploadStatus('uploading')
      // Pass the activeChatId to link the uploaded document to this chat
      const result = await uploadPdfToCloudinary(selectedFile, activeChatId)
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
    } catch (error) {
      console.error(error)
      setUploadStatus('error')
    }
  }, [selectedFile, activeChatId])

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
  }
}
