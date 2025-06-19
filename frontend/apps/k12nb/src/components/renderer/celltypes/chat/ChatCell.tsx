import {marked} from 'marked';
import React, {useEffect, useRef, useState, KeyboardEvent} from 'react';

import {notebookStore} from '@/components/renderer/store/notebookStore';

import {sendChatCompletion} from './chatService';
import type {ChatConfig, ChatMessage} from './types';
import Button from '@code-dot-org/component-library/button';

export default function ChatCell({cell, locale}: {cell: any; locale: string}) {
  const [error, setError] = useState<string | null>(null);
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const source = notebookStore.getLocalizedSource(cell.id, locale);
      if (!source || source.length === 0)
        throw new Error('No chat configuration found');
      const jsonString = source.join('').trim();
      const config = JSON.parse(jsonString) as ChatConfig;
      if (!config.url) throw new Error('Chat URL is required');
      if (!config.model) throw new Error('Model name is required');
      if (!config.messages || !Array.isArray(config.messages))
        throw new Error('Messages array is required');
      setChatConfig({
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
        ...config,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid chat configuration');
      setChatConfig(null);
    }
  }, [cell, locale]);

  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop =
        messagesContainer.current.scrollHeight;
    }
  }, [chatConfig, isLoading]);

  function processMessageContent(content: string) {
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/gi;
    let thinkingContent: string | null = null;
    let mainContent = content;
    const thinkingMatches = content.match(thinkingRegex);
    if (thinkingMatches && thinkingMatches.length > 0) {
      thinkingContent = thinkingMatches
        .map(match => match.replace(/<\/?think>/gi, '').trim())
        .join('\n\n');
      mainContent = content.replace(thinkingRegex, '').trim();
    }
    return {thinkingContent, mainContent, hasThinking: !!thinkingContent};
  }

  function renderMarkdown(content: string) {
    try {
      const result = marked(content, {breaks: true, gfm: true});
      return typeof result === 'string' ? result : content;
    } catch {
      return content;
    }
  }

  function processMessage(message: ChatMessage) {
    const processed = processMessageContent(message.content);
    return {
      ...processed,
      renderedMain:
        message.role === 'assistant'
          ? renderMarkdown(processed.mainContent)
          : processed.mainContent,
      renderedThinking: processed.thinkingContent
        ? renderMarkdown(processed.thinkingContent)
        : null,
    };
  }

  function saveChatConfig(cfg: ChatConfig) {
    try {
      const configJson = JSON.stringify(cfg, null, 2);
      const sourceLines = configJson.split('\n');
      notebookStore.setSource(cell.id, sourceLines);
    } catch (err) {
      console.error('Failed to save chat configuration:', err);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !chatConfig || isLoading) return;
    const userMessage: ChatMessage = {role: 'user', content: newMessage.trim()};
    const updatedConfig = {
      ...chatConfig,
      messages: [...chatConfig.messages, userMessage],
    };
    setChatConfig(updatedConfig);
    setNewMessage('');
    saveChatConfig(updatedConfig);
    setIsLoading(true);
    setError(null);
    try {
      const assistantMessage = await sendChatCompletion(
        updatedConfig,
        updatedConfig.messages,
      );
      const nextConfig = {
        ...updatedConfig,
        messages: [...updatedConfig.messages, assistantMessage],
      };
      setChatConfig(nextConfig);
      saveChatConfig(nextConfig);
    } catch (err: any) {
      setError(err.message || 'Failed to get response from AI');
      setChatConfig(cfg =>
        cfg ? {...cfg, messages: cfg.messages.slice(0, -1)} : cfg,
      );
      setNewMessage(userMessage.content);
      saveChatConfig(chatConfig);
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    if (!chatConfig) return;
    const cleared = {
      ...chatConfig,
      messages: chatConfig.messages.filter(msg => msg.role === 'system'),
    };
    setChatConfig(cleared);
    saveChatConfig(cleared);
  }

  function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const displayMessages =
    chatConfig?.messages.filter(msg => msg.role !== 'system') || [];
  const systemMessage = chatConfig?.messages.find(msg => msg.role === 'system');

  return (
    <div className="chat-cell">
      {error && <div className="alert error">{error}</div>}
      {!error && chatConfig && (
        <div className="chat-container">
          {systemMessage && (
            <div className="alert info">
              <div className="system-label">System Message:</div>
              <div>{systemMessage.content}</div>
            </div>
          )}
          <div className="chat-messages" ref={messagesContainer}>
            {displayMessages.map((message, idx) => {
              const processed = processMessage(message);
              return (
                <div key={idx} className={`message-wrapper ${message.role}`}>
                  <div className={`message-bubble ${message.role}`}>
                    <div className="message-role">{message.role}</div>
                    {message.role === 'assistant' ? (
                      <>
                        {processed.hasThinking && (
                          <details className="thinking-panel">
                            <summary className="thinking-title">
                              🧠 <span>Thinking Process</span>
                            </summary>
                            <div
                              className="thinking-content markdown-content"
                              dangerouslySetInnerHTML={{
                                __html: processed.renderedThinking || '',
                              }}
                            />
                          </details>
                        )}
                        <div
                          className="message-content markdown-content"
                          dangerouslySetInnerHTML={{
                            __html: processed.renderedMain,
                          }}
                        />
                      </>
                    ) : (
                      <div className="message-content">{message.content}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-bubble assistant">
                  <div className="message-role">assistant</div>
                  <div className="message-content">
                    <span className="spinner" /> Thinking...
                  </div>
                </div>
              </div>
            )}
            {displayMessages.length === 0 && !isLoading && (
              <div className="empty-chat">
                <span style={{fontSize: 48, color: '#bbb'}}>💬</span>
                <p className="text-body-2 text-grey">Start a conversation...</p>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              disabled={isLoading}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button
              type={'secondary'}
              className="send-btn"
              disabled={!newMessage.trim() || isLoading}
              onClick={sendMessage}
              text={'➤'}
            >
              ➤
            </Button>
            <Button
              className="clear-btn"
              disabled={isLoading || displayMessages.length === 0}
              onClick={clearChat}
              text={'Clear Chat'}
            ></Button>
          </div>
          <div className="chat-config-info">
            <span className="chip">Model: {chatConfig.model}</span>
            <span className="chip">T: {chatConfig.temperature}</span>
            <span className="chip">
              Max: {chatConfig.max_tokens === -1 ? '∞' : chatConfig.max_tokens}
            </span>
          </div>
        </div>
      )}
      {!error && !chatConfig && (
        <div className="loading">
          <span className="spinner" />
          <p>Loading chat...</p>
        </div>
      )}
      <style jsx>{`
        .chat-cell {
          max-width: 800px;
          margin: 0 auto;
        }
        .alert.error {
          color: #b00;
          background: #fee;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .alert.info {
          color: #1976d2;
          background: #e3f2fd;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .system-label {
          font-size: 0.8em;
          color: #888;
          margin-bottom: 4px;
        }
        .chat-container {
          width: 100%;
        }
        .chat-messages {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          padding: 16px 0;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 16px;
          background: #fafbfc;
        }
        .message-wrapper {
          margin-bottom: 12px;
          display: flex;
        }
        .message-wrapper.user {
          justify-content: flex-end;
        }
        .message-wrapper.assistant {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          position: relative;
        }
        .message-bubble.user {
          background: #1976d2;
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .message-bubble.assistant {
          background: #f5f5f5;
          color: #222;
          border-bottom-left-radius: 4px;
        }
        .message-role {
          font-size: 0.75rem;
          font-weight: 500;
          opacity: 0.8;
          margin-bottom: 4px;
          text-transform: capitalize;
        }
        .message-content {
          font-size: 0.875rem;
          line-height: 1.4;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .markdown-content {
          white-space: normal;
        }
        .thinking-panel {
          background: #f0f0f0;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .thinking-title {
          font-size: 0.75rem;
          padding: 8px 12px;
          cursor: pointer;
        }
        .thinking-content {
          font-size: 0.8rem;
          opacity: 0.9;
        }
        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 150px;
          text-align: center;
        }
        .chat-input-area {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .chat-input {
          flex: 1;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .send-btn,
        .clear-btn {
          padding: 8px 12px;
          border-radius: 4px;
          border: none;
          background: #1976d2;
          color: #fff;
          cursor: pointer;
        }
        .clear-btn {
          background: #fbc02d;
          color: #222;
        }
        .send-btn:disabled,
        .clear-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-config-info {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .chip {
          background: #eee;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.85em;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #eee;
          border-top: 2px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 600px) {
          .message-bubble {
            max-width: 85%;
          }
          .chat-config-info {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
