import React, {FC, useCallback, useState} from 'react';

import {CompletedChatMessage} from '@cdo/apps/aichat/types';
import ChatEventsList from '@cdo/apps/aichat/views/ChatEventsList';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import VocabularyFlashcards from './VocabularyFlashcards';

import moduleStyles from '@cdo/apps/aichat/views/chatWorkspace.module.scss';

type VocabularyItem = {id: string; word: string; definition: string};

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AssistantMessage extends ChatHistoryMessage {
  role: 'assistant';
  showFlashcards?: boolean;
  flashcardVocabularyIds?: string[];
}

type ChatEntry = ChatHistoryMessage | AssistantMessage;

interface LessonPracticeChatWorkspaceProps {
  lessonId: number;
  vocabulary: VocabularyItem[];
}

const LessonPracticeChatWorkspace: FC<LessonPracticeChatWorkspaceProps> = ({
  lessonId,
  vocabulary,
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatHistoryMessage = {
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setIsLoading(true);

      const history = messages.map(m => ({role: m.role, content: m.content}));

      try {
        const response = await fetch('/lesson_practice_ai_tutor/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token':
              (
                document.querySelector(
                  'meta[name="csrf-token"]'
                ) as HTMLMetaElement
              )?.content || '',
          },
          body: JSON.stringify({lesson_id: lessonId, message: text, history}),
        });

        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        const assistantMsg: AssistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          showFlashcards: data.show_flashcards,
          flashcardVocabularyIds: data.flashcard_vocabulary_ids,
        };
        setMessages([...nextMessages, assistantMsg]);
      } catch {
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, lessonId]
  );

  const chatEvents = messages.map(
    (msg, i) =>
      ({
        chatMessageText: msg.content,
        role: msg.role === 'user' ? Role.USER : Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        timestamp: msg.timestamp,
        requestId: i,
      } as CompletedChatMessage)
  );

  const lastAssistantMsg = messages[messages.length - 1] as
    | AssistantMessage
    | undefined;
  const flashcards = (() => {
    if (
      !lastAssistantMsg?.showFlashcards ||
      !lastAssistantMsg?.flashcardVocabularyIds?.length
    ) {
      return [];
    }
    const ids = new Set(lastAssistantMsg.flashcardVocabularyIds);
    const filtered = vocabulary.filter(v => ids.has(v.id));
    return filtered.length > 0 ? filtered : vocabulary;
  })();

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      <ChatEventsList events={chatEvents} isAiTutorVersion />
      {flashcards.length > 0 && (
        <VocabularyFlashcards vocabulary={flashcards} />
      )}
      <div className={moduleStyles.footer}>
        <UserMessageEditor
          userMessage={userMessage}
          onChange={setUserMessage}
          onSubmit={text => {
            sendMessage(text);
            setUserMessage('');
          }}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default LessonPracticeChatWorkspace;
