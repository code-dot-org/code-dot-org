import {Box, CircularProgress, Stack, TextField, Typography} from '@mui/material';
import React, {FC, useCallback, useRef, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import VocabularyFlashcards from './VocabularyFlashcards';

type VocabularyItem = {id: string; word: string; definition: string};

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantMessage extends ChatHistoryMessage {
  role: 'assistant';
  showFlashcards?: boolean;
  flashcardVocabularyIds?: string[];
}

type ChatEntry = ChatHistoryMessage | AssistantMessage;

interface LessonPracticeChatWorkspaceProps {
  scriptId: string;
  lessonPosition: number;
  vocabulary: VocabularyItem[];
}

const LessonPracticeChatWorkspace: FC<LessonPracticeChatWorkspaceProps> = ({
  scriptId,
  lessonPosition,
  vocabulary,
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatHistoryMessage = {role: 'user', content: text};
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Build history excluding the message we just added (backend adds it separately)
    const history = messages.map(m => ({role: m.role, content: m.content}));

    try {
      const response = await fetch('/lesson_practice_ai_tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token':
            (
              document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
            )?.content || '',
        },
        body: JSON.stringify({
          script_id: scriptId,
          lesson_position: lessonPosition,
          message: text,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      const assistantMessage: AssistantMessage = {
        role: 'assistant',
        content: data.response,
        showFlashcards: data.show_flashcards,
        flashcardVocabularyIds: data.flashcard_vocabulary_ids,
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch {
      setError('Something went wrong. Please try again.');
      // Remove the user message that failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputText, isLoading, messages, scriptId, lessonPosition]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const flashcardsForMessage = (msg: ChatEntry): VocabularyItem[] => {
    const assistantMsg = msg as AssistantMessage;
    if (!assistantMsg.showFlashcards || !assistantMsg.flashcardVocabularyIds?.length) {
      return [];
    }
    const ids = new Set(assistantMsg.flashcardVocabularyIds);
    const filtered = vocabulary.filter(v => ids.has(v.id));
    return filtered.length > 0 ? filtered : vocabulary;
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        {messages.map((msg, i) => {
          const flashcards = flashcardsForMessage(msg);
          return (
            <Box key={i}>
              <ChatMessage
                text={msg.content}
                role={msg.role === 'user' ? Role.USER : Role.ASSISTANT}
                isAiTutorVersion={true}
              />
              {flashcards.length > 0 && (
                <Box mt={2}>
                  <VocabularyFlashcards vocabulary={flashcards} />
                </Box>
              )}
            </Box>
          );
        })}
        {isLoading && (
          <Stack direction="row" spacing={1} alignItems="center" pl={1}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Thinking...
            </Typography>
          </Stack>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Ask a question about the lesson..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.brandSecondaryDefault}
          text="Send"
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
        />
      </Stack>
    </Stack>
  );
};

export default LessonPracticeChatWorkspace;
