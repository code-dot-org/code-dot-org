import React, {FC, useCallback, useMemo, useState} from 'react';

import {ModelParameters} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

import VocabularyFlashcards from './VocabularyFlashcards';

type VocabularyItem = {id: string; word: string; definition: string};

interface LessonPracticeChatWorkspaceProps {
  lessonId: number;
  lessonName: string;
  vocabulary: VocabularyItem[];
}

const LessonPracticeChatWorkspace: FC<LessonPracticeChatWorkspaceProps> = ({
  lessonId,
  lessonName,
  vocabulary,
}) => {
  const [flashcardVocabularyIds, setFlashcardVocabularyIds] = useState<
    string[]
  >([]);

  const modelParameters = useMemo(
    (): ModelParameters => ({
      systemPrompt: `You are a friendly and encouraging AI tutor helping a student review "${lessonName}".`,
      selectedModelId: AiChatModelIds.CHATGPT,
      temperature: 0.7,
      retrievalContexts: [],
      lessonId,
    }),
    [lessonId, lessonName]
  );

  // Parse the JSON-wrapped response from the lesson practice agent.
  // The agent returns {message: string, vocabulary_ids: string[]}.
  const responseCallback = useCallback((response: string) => {
    try {
      const parsed = JSON.parse(response);
      setFlashcardVocabularyIds(parsed.vocabulary_ids ?? []);
      return parsed.message ?? response;
    } catch {
      setFlashcardVocabularyIds([]);
      return response;
    }
  }, []);

  const flashcards = useMemo(() => {
    if (flashcardVocabularyIds.length === 0) return [];
    const ids = new Set(flashcardVocabularyIds);
    const filtered = vocabulary.filter(v => ids.has(v.id));
    return filtered.length > 0 ? filtered : vocabulary;
  }, [flashcardVocabularyIds, vocabulary]);

  return (
    <>
      <ChatWorkspace
        modelParameters={modelParameters}
        clientType={AiChatClientTypes.LESSON_PRACTICE_AI_TUTOR}
        responseCallback={responseCallback}
        hideModelChangeMessage
        lessonId={lessonId}
      />
      {flashcards.length > 0 && (
        <VocabularyFlashcards vocabulary={flashcards} />
      )}
    </>
  );
};

export default LessonPracticeChatWorkspace;
