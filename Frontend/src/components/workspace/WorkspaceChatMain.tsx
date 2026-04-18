import type { KeyboardEvent, MutableRefObject } from 'react'
import type { Message, ReasoningLevel } from '@/types/workspace'
import styles from '@/components/workspace/Workspace.module.css'

type WorkspaceChatMainProps = {
  workspaceName: string
  messages: Message[]
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
}

export function WorkspaceChatMain({
  workspaceName,
  messages,
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
        {messages.map((message) => (
          <article
            key={message.id}
            className={message.role === 'user' ? `${styles.msg} ${styles.msgUser}` : `${styles.msg} ${styles.msgAi}`}
          >
            <div className={styles.msgAvatar}>
              <span className="material-symbols-outlined">{message.role === 'user' ? 'person' : 'bolt'}</span>
            </div>
            <div className={styles.msgBody}>
              <p>{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className={styles.citations}>
                  {message.citations.map((citation) => (
                    <span key={citation}>{citation}</span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
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
          <div className={styles.enterHint} aria-hidden="true" title="Press Enter to send">
            <span className="material-symbols-outlined">keyboard_return</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
