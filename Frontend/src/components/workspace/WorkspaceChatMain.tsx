import type { KeyboardEvent, MutableRefObject } from 'react'
import type { Message, ReasoningLevel } from '../../types/workspace'

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
    <main className="ws-chat-main">
      <header className="ws-chat-header">
        <div>
          <h1>{workspaceName}</h1>
        </div>
        <div className="ws-chat-header-actions">
          <select value={domain} onChange={(event) => onDomainChange(event.target.value)}>
            {domainOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button type="button" className="ws-icon-btn" aria-label="Share">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <div className="ws-chat-scroll">
        {messages.map((message) => (
          <article key={message.id} className={message.role === 'user' ? 'ws-msg ws-msg-user' : 'ws-msg ws-msg-ai'}>
            <div className="ws-msg-avatar">
              <span className="material-symbols-outlined">{message.role === 'user' ? 'person' : 'bolt'}</span>
            </div>
            <div className="ws-msg-body">
              <p>{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="ws-citations">
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

      <footer className="ws-composer-wrap">
        <div className="ws-quick-prompts">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className="ws-prompt-chip" onClick={() => onUseQuickPrompt(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
        <div className="ws-composer">
          <div className="ws-composer-icon">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={composerText}
            onChange={(event) => onComposerChange(event.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder="Ask about compliance, statutes, or risk factors..."
          />
          <button type="button" className="ws-icon-btn" aria-label="Attach file">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <div className="ws-level-menu">
            <button type="button" className="ws-icon-btn" aria-label="Reasoning level" onClick={onToggleReasoningMenu}>
              <span className="material-symbols-outlined">tune</span>
            </button>
            {showReasoningMenu && (
              <div className="ws-reasoning-level" role="radiogroup" aria-label="Reasoning level">
                <button
                  type="button"
                  className={reasoningLevel === 'low' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                  onClick={() => onChangeReasoning('low')}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={reasoningLevel === 'medium' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                  onClick={() => onChangeReasoning('medium')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={reasoningLevel === 'high' ? 'ws-level-btn ws-level-btn-active' : 'ws-level-btn'}
                  onClick={() => onChangeReasoning('high')}
                >
                  High
                </button>
              </div>
            )}
          </div>
          <div className="ws-enter-hint" aria-hidden="true" title="Press Enter to send">
            <span className="material-symbols-outlined">keyboard_return</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
