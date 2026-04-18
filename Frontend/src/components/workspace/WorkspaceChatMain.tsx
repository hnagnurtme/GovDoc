import type { KeyboardEvent, MutableRefObject } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message, ReasoningLevel } from '@/types/workspace'
import styles from '@/components/workspace/Workspace.module.css'

type ParsedSections = {
  summary: string
  basis: string
  note: string
  footer: string
}

function cleanTaggedValue(value: string): string {
  return value.replace(/^\s*[:\-]*\s*\**\s*/, '').trim()
}

type TagMatch = {
  name: 'summary' | 'basis' | 'note'
  index: number
  markerLength: number
}

function findTagMatch(text: string, name: TagMatch['name'], pattern: RegExp): TagMatch | null {
  const match = pattern.exec(text)
  if (!match || match.index === undefined) {
    return null
  }
  return {
    name,
    index: match.index,
    markerLength: match[0].length,
  }
}

function parseTaggedAnswer(content: string): ParsedSections | null {
  const text = content.trim()
  if (!text) {
    return null
  }

  const tags = [
    findTagMatch(text, 'summary', /(?:\*\*)?\s*\[(?:TOM TAT|TÓM TẮT)\]\s*(?:\*\*)?\s*:?/i),
    findTagMatch(text, 'basis', /(?:\*\*)?\s*\[(?:CAN CU|CĂN CỨ)\]\s*(?:\*\*)?\s*:?/i),
    findTagMatch(text, 'note', /(?:\*\*)?\s*\[(?:LUU Y|LƯU Ý)\]\s*(?:\*\*)?\s*:?/i),
  ]
    .filter((tag): tag is TagMatch => tag !== null)
    .sort((a, b) => a.index - b.index)

  if (tags.length === 0) {
    return null
  }

  const sections: ParsedSections = {
    summary: '',
    basis: '',
    note: '',
    footer: '',
  }

  for (let i = 0; i < tags.length; i += 1) {
    const current = tags[i]
    const next = tags[i + 1]
    const start = current.index + current.markerLength
    const end = next ? next.index : text.length
    const rawValue = text.slice(start, end)
    sections[current.name] = cleanTaggedValue(rawValue)
  }

  const firstTag = tags[0]
  if (firstTag && firstTag.name !== 'summary' && !sections.summary) {
    const prefix = text.slice(0, firstTag.index).trim()
    sections.summary = cleanTaggedValue(prefix)
  }

  const footerMatch = text.match(/(?:GovDoc Intellisense|—\s*GovDoc Intellisense)[\s\S]*$/i)
  const footer = footerMatch ? footerMatch[0].trim() : ''

  return {
    summary: sections.summary,
    basis: sections.basis.replace(/\s*—\s*GovDoc Intellisense[\s\S]*$/i, '').trim(),
    note: sections.note.replace(/\s*—\s*GovDoc Intellisense[\s\S]*$/i, '').trim(),
    footer,
  }
}

function parseBasisLines(rawBasis: string): string[] {
  const compact = rawBasis.replace(/\s+-\s+/g, '\n- ').trim()
  const byBullet = compact
    .split(/\n|(?=\s-\s)|(?=\s•\s)/g)
    .map((item) => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)

  if (byBullet.length > 1) {
    return byBullet
  }

  const byLawBreak = compact
    .split(/\s(?=Điều\s\d+|Dieu\s\d+)/g)
    .map((item) => item.trim())
    .filter(Boolean)

  return byLawBreak.length > 1 ? byLawBreak : byBullet
}

function MarkdownBlock({ content, compact = false }: { content: string; compact?: boolean }) {
  return (
    <div className={compact ? `${styles.markdownContent} ${styles.markdownCompact}` : styles.markdownContent}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

type WorkspaceChatMainProps = {
  workspaceName: string
  messages: Message[]
  isAwaitingAssistant: boolean
  messageEndRef: MutableRefObject<HTMLDivElement | null>
  quickPrompts: string[]
  composerText: string
  domain: string
  domainOptions: string[]
  reasoningLevel: ReasoningLevel
  showReasoningMenu: boolean
  onDomainChange: (value: string) => void
  onComposerChange: (value: string) => void
  onComposerKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onUseQuickPrompt: (value: string) => void
  onToggleReasoningMenu: () => void
  onChangeReasoning: (value: ReasoningLevel) => void
  onSendMessage: () => void
}

export function WorkspaceChatMain({
  workspaceName,
  messages,
  isAwaitingAssistant,
  messageEndRef,
  quickPrompts,
  composerText,
  domain,
  domainOptions,
  reasoningLevel,
  showReasoningMenu,
  onDomainChange,
  onComposerChange,
  onComposerKeyDown,
  onUseQuickPrompt,
  onToggleReasoningMenu,
  onChangeReasoning,
  onSendMessage,
}: WorkspaceChatMainProps) {
  return (
    <main className={styles.chatMain}>
      <header className={styles.chatHeader}>
        <div>
          <h1>{workspaceName}</h1>
        </div>
        <div className={styles.chatHeaderActions}>
          <select value={domain} onChange={(event) => onDomainChange(event.target.value)}>
            {domainOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button type="button" className={styles.iconBtn} aria-label="Share">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <div className={styles.chatScroll}>
        {messages.map((message) => {
          const parsed = message.role === 'assistant' ? parseTaggedAnswer(message.content) : null
          const basisLines = parsed ? parseBasisLines(parsed.basis) : []

          return (
            <article
              key={message.id}
              className={message.role === 'user' ? `${styles.msg} ${styles.msgUser}` : `${styles.msg} ${styles.msgAi}`}
            >
              <div className={styles.msgAvatar}>
                <span className="material-symbols-outlined">{message.role === 'user' ? 'person' : 'bolt'}</span>
              </div>
              <div className={styles.msgBody}>
                {!parsed ? (
                  message.role === 'assistant' ? <MarkdownBlock content={message.content} /> : <p>{message.content}</p>
                ) : (
                  <div className={styles.legalSections}>
                    {parsed.summary && (
                      <section className={styles.legalSection}>
                        <h4>Tóm tắt</h4>
                        <MarkdownBlock content={parsed.summary} compact />
                      </section>
                    )}
                    {basisLines.length > 0 && (
                      <section className={styles.legalSection}>
                        <h4>Căn cứ</h4>
                        <ul>
                          {basisLines.map((line) => (
                            <li key={line}>
                              <MarkdownBlock content={line} compact />
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {parsed.note && (
                      <section className={styles.legalSection}>
                        <h4>Lưu ý</h4>
                        <MarkdownBlock content={parsed.note} compact />
                      </section>
                    )}
                    {parsed.footer && <small className={styles.legalFooter}>{parsed.footer}</small>}
                  </div>
                )}
                {message.citations && message.citations.length > 0 && (
                  <div className={styles.citations}>
                    {message.citations.map((citation) => (
                      <span key={citation}>{citation}</span>
                    ))}
                  </div>
                )}
                {message.createdAt && <small className={styles.msgMeta}>{message.createdAt}</small>}
              </div>
            </article>
          )
        })}
        {isAwaitingAssistant && (
          <article className={`${styles.msg} ${styles.msgAi}`}>
            <div className={styles.msgAvatar}>
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div className={`${styles.msgBody} ${styles.loadingMsgBody}`}>
              <span className={styles.loadingSpinner} aria-hidden="true" />
              <span className={styles.loadingText}>Đang tạo phản hồi...</span>
            </div>
          </article>
        )}
        <div ref={messageEndRef} />
      </div>

      <footer className={styles.composerWrap}>
        <div className={styles.quickPrompts}>
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className={styles.promptChip} onClick={() => onUseQuickPrompt(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
        <div className={styles.composer}>
          <div className={styles.composerIcon}>
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={composerText}
            onChange={(event) => onComposerChange(event.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder="Ask about compliance, statutes, or risk factors..."
          />
          <button type="button" className={styles.iconBtn} aria-label="Attach file">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <div className={styles.levelMenu}>
            <button type="button" className={styles.iconBtn} aria-label="Reasoning level" onClick={onToggleReasoningMenu}>
              <span className="material-symbols-outlined">tune</span>
            </button>
            {showReasoningMenu && (
              <div className={styles.reasoningLevel} role="radiogroup" aria-label="Reasoning level">
                <button
                  type="button"
                  className={reasoningLevel === 'low' ? `${styles.levelBtn} ${styles.levelBtnActive}` : styles.levelBtn}
                  onClick={() => onChangeReasoning('low')}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={reasoningLevel === 'medium' ? `${styles.levelBtn} ${styles.levelBtnActive}` : styles.levelBtn}
                  onClick={() => onChangeReasoning('medium')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={reasoningLevel === 'high' ? `${styles.levelBtn} ${styles.levelBtnActive}` : styles.levelBtn}
                  onClick={() => onChangeReasoning('high')}
                >
                  High
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.sendBtn}`}
            aria-label="Send"
            title="Send"
            disabled={!composerText.trim()}
            onClick={onSendMessage}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>
    </main>
  )
}
