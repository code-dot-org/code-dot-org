import React, {useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  AiInteractionStatus as Status,
  AiDiffContext,
} from '@cdo/generated-scripts/sharedConstants';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';

import AiDiffBotMessageFooter from './AiDiffBotMessageFooter';
import AiDiffChatFooter from './AiDiffChatFooter';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  EXTRA_PRACTICE_PROMPT,
  FINISH_EARLY_PROMPT,
  ADJUST_TIMING_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  REAL_WORLD_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  LESSON_HOOK_PROMPT,
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  PROFESSIONAL_LEARNING_PROMPT,
  CREATE_SECTION_PROMPT,
  ADDITIONAL_HELP_PROMPT,
  APCSP_DUMMY_CREATE,
  APCSP_DUMMY_EXAM,
  DEBUG_THIS_CODE,
  IMPROVE_THIS_CODE,
} from './AiDiffPredefinedPrompts';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {ChatItem, ChatPrompt, Context} from './types';

import style from './ai-differentiation.module.scss';

const INITIAL_CHAT_MESSAGE = `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`;

const APCSP_PROMPTS = [APCSP_DUMMY_CREATE, APCSP_DUMMY_EXAM];

const SUGGESTED_PROMPTS = [
  [
    EXAMPLE_PROMPT,
    EXPLAIN_CONCEPT_PROMPT,
    DEBUG_MISTAKES_PROMPT,
    MINI_LESSON_PROMPT,
    EXIT_TICKET_PROMPT,
  ],
  [
    FINISH_EARLY_PROMPT,
    EXTRA_PRACTICE_PROMPT,
    LESSON_HOOK_PROMPT,
    ADJUST_TIMING_PROMPT,
    REAL_WORLD_PROMPT,
  ],
];

const GENERAL_SUGGESTED_PROMPTS = [
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  PROFESSIONAL_LEARNING_PROMPT,
  CREATE_SECTION_PROMPT,
  ADDITIONAL_HELP_PROMPT,
];

const AIDIFF_THREADS_ENDPOINT = '/aidiff_threads';
const AIDIFF_CHAT_COMPLETION = 'chat_completion';

interface AiDiffChatProps {
  context: Context;
  scriptName?: string;
  chatResponseCallback?: () => void;
  initialChatMessage?: string;
  suggestedPrompts?: ChatPrompt[];
  disableEndButtons?: boolean;
  curriculumCourses?: string[];
}

const AiDiffChat: React.FC<AiDiffChatProps> = ({
  context,
  scriptName,
  chatResponseCallback = () => {},
  initialChatMessage = INITIAL_CHAT_MESSAGE,
  suggestedPrompts = context.type === AiDiffContext.GENERAL
    ? GENERAL_SUGGESTED_PROMPTS
    : SUGGESTED_PROMPTS[0],
  disableEndButtons = false,
  curriculumCourses = [],
}) => {
  const reportingData = React.useMemo(() => {
    return {
      chatContext: context,
      scriptName,
    };
  }, [context, scriptName]);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [suggestionPage, setSuggestionPage] = useState(0);

  const [threadId, setThreadId] = useState(null);

  const viewAsUserId = useAppSelector(
    state => state.progress?.viewAsUserId || undefined
  );

  const additionalPrompts: ChatPrompt[] = [];
  if (curriculumCourses.includes('csp')) {
    additionalPrompts.push(...APCSP_PROMPTS);
  }
  if (context.type === AiDiffContext.LEVEL) {
    additionalPrompts.push(DEBUG_THIS_CODE, IMPROVE_THIS_CODE);
  }

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>([
    {
      role: Role.ASSISTANT,
      chatMessageText: initialChatMessage,
      status: Status.OK,
    },
    suggestedPrompts.concat(additionalPrompts),
  ]);

  const onMessageSend = (message: string) => {
    const newUserMessage = {
      role: Role.USER,
      chatMessageText: message,
      status: Status.OK,
    };

    setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
    getAIResponse(message, false, null);
  };

  const onPromptSelect = (prompt: ChatPrompt) => {
    if (prompt.response !== undefined) {
      setMessageHistory(prevMessages => [
        ...prevMessages,
        {
          role: Role.ASSISTANT,
          chatMessageText: prompt.response ?? '',
          status: Status.OK,
        },
      ]);
    }
    if (prompt.followUpPrompts !== undefined) {
      setMessageHistory(prevMessages => [
        ...prevMessages,
        prompt.followUpPrompts ?? [],
      ]);
    }
    if (!prompt.followUpPrompts && !prompt.response) {
      getAIResponse(prompt.prompt, true, prompt.label);
    }
  };

  const onSuggestPrompts = () => {
    const nextPage = (suggestionPage + 1) % SUGGESTED_PROMPTS.length;
    const newSuggestions =
      context.type === AiDiffContext.GENERAL
        ? GENERAL_SUGGESTED_PROMPTS
        : SUGGESTED_PROMPTS[nextPage];
    setSuggestionPage(nextPage);
    setMessageHistory(prevMessages => [
      ...prevMessages,
      newSuggestions.concat(additionalPrompts),
    ]);
  };

  const sendChatEvent = React.useCallback(
    (role: string, prompt: string, preset: boolean, thread: number) => {
      const responseEventData = {
        ...reportingData,
        role: role,
        isPreset: preset,
        text: prompt,
        threadId: thread,
        url: window.location.href,
      };
      analyticsReporter.sendEvent(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
    },
    [reportingData]
  );

  const getAIResponse = React.useCallback(
    (prompt: string, isPreset: boolean, presetChipText: string | null) => {
      setIsWaitingForResponse(true);

      if (threadId !== null) {
        sendChatEvent(Role.USER, prompt, isPreset, threadId);
      }

      const endpoint =
        threadId === null
          ? `${AIDIFF_THREADS_ENDPOINT}`
          : `${AIDIFF_THREADS_ENDPOINT}/${threadId}/${AIDIFF_CHAT_COMPLETION}`;

      const body = JSON.stringify({
        inputText: prompt,
        isPreset,
        presetChipText,
        ...(threadId === null ? {context} : {}),
        ...(context.type === AiDiffContext.LEVEL ? {viewAsUserId} : {}),
      });

      HttpClient.post(endpoint, body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then(json => {
          const newAiMessage = {
            role: Role.ASSISTANT,
            chatMessageText: json.chat_message_text,
            status: json.status,
            id: json.message_id,
          };

          // logging here because on the first user message the threadID is null
          // we only get a threadID initialized in the response
          if (threadId === null) {
            sendChatEvent(Role.USER, prompt, isPreset, json.thread_id);
          }

          sendChatEvent(
            Role.ASSISTANT,
            json.chat_message_text,
            isPreset,
            json.thread_id
          );
          if (json.thread_id) {
            setThreadId(json.thread_id);
          }
          setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
        })
        .catch(error => console.log(error))
        .finally(() => {
          setIsWaitingForResponse(false);
          chatResponseCallback();
        });
    },
    [context, threadId, viewAsUserId, chatResponseCallback, sendChatEvent]
  );

  // Scroll to bottom of content when a new message comes in
  const chatWindowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatWindowRef.current?.lastElementChild?.scrollIntoView();
  }, [messageHistory]);
  return (
    <div className={style.chatContainer}>
      <div className={style.chatContent} ref={chatWindowRef}>
        {messageHistory.map((item: ChatItem, id: number) =>
          Array.isArray(item) ? (
            <AiDiffSuggestedPrompts
              suggestedPrompts={item}
              isLatest={id === messageHistory.length - 1}
              onSubmit={onPromptSelect}
              key={id}
            />
          ) : (
            <ChatMessage
              text={item.chatMessageText}
              role={item.role}
              customStyles={style}
              key={id}
              isTA={true}
              footer={
                item.role === Role.ASSISTANT && (
                  <AiDiffBotMessageFooter
                    message={item}
                    reportingData={reportingData}
                  />
                )
              }
            />
          )
        )}
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={
            isWaitingForResponse
              ? style.waitingForResponse
              : style.hideWaitingForResponse
          }
        />
      </div>
      <AiDiffChatFooter
        onSubmit={onMessageSend}
        onSuggestPrompts={onSuggestPrompts}
        messages={messageHistory}
        waiting={isWaitingForResponse}
        disableEndButtons={disableEndButtons}
      />
    </div>
  );
};

export default AiDiffChat;
