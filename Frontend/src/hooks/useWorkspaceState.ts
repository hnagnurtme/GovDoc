import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { fetchWorkspaceData, requestAssistantReply, uploadPdfToCloudinary } from '@/api/workspaceApi'
import type { ChatItem, ChatFolder, Message, ReasoningLevel, UploadStatus } from '@/types/workspace'
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
  const [quickPrompts, setQuickPrompts] = useState<string[]>([])
  const [domainOptions, setDomainOptions] = useState<string[]>(['All'])
  const [activeChatId, setActiveChatId] = useState('')
  const [historyFilter, setHistoryFilter] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(DEFAULT_EXPANDED)
  const [composerText, setComposerText] = useState('')
  const [domain, setDomain] = useState('All')
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>('medium')
  const [showReasoningMenu, setShowReasoningMenu] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('No file uploaded')
  const [filePages, setFilePages] = useState<number | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void (async () => {
      const data = await fetchWorkspaceData()
      setWorkspaceName(data.workspaceName)
      setDocumentTitle(data.documentTitle)
      setFolders(data.folders)
      setChats(data.chats)
      setMessagesByChat(data.messagesByChat)
      setQuickPrompts(data.quickPrompts)
      setDomainOptions(data.domainOptions)
      setActiveChatId(data.chats[0]?.id ?? '')
      setIsLoading(false)
    })()
  }, [])

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

  const startNewChat = useCallback(() => {
    const id = makeId('chat')
    const newChat: ChatItem = {
      id,
      title: 'New conversation',
      updatedAt: 'Just now',
      folderId: 'contracts',
    }

    setChats((prev) => [newChat, ...prev])
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === 'contracts' ? { ...folder, chatIds: [id, ...folder.chatIds] } : folder,
      ),
    )
    setMessagesByChat((prev) => ({
      ...prev,
      [id]: [
        {
          id: makeId('m-assistant'),
          role: 'assistant',
          content: 'New chat created. Upload a PDF and ask your legal question.',
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

    const assistantMessage = await requestAssistantReply(text, reasoningLevel)
    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), assistantMessage],
    }))
  }, [composerText, activeChatId, reasoningLevel])

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
    if (!selectedFile) {
      setUploadStatus('error')
      return
    }

    try {
      setUploadStatus('uploading')
      const result = await uploadPdfToCloudinary(selectedFile)
      setUploadStatus('success')
      setFilePages(result.pages)
      setFileUrl(result.secureUrl)
      if (result.originalFilename) {
        setDocumentTitle(result.originalFilename)
      }
    } catch (error) {
      console.error(error)
      setUploadStatus('error')
    }
  }, [selectedFile])

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
    uploadStatus,
    fileName,
    filePages,
    fileUrl,
    onPickFile,
    triggerUpload,
    startNewChat,
    isLoading,
  }
}
