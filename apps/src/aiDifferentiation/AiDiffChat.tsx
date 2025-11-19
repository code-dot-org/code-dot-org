import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
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
import AiDiffChatHeader from './AiDiffChatHeader';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {defaultThreadTitle} from './constants';
import {
  contextPrompts,
  APCSP_DUMMY_CREATE,
  APCSP_DUMMY_EXAM,
  SUGGESTED_PROMPTS_FOR_SELECTION,
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  CREATE_SECTION_PROMPT,
} from './predefinedPrompts';
import {ChatItem, ChatPrompt, Context, SuggestPromptsType} from './types';

import style from './ai-differentiation.module.scss';

const APCSP_PROMPTS = [APCSP_DUMMY_CREATE, APCSP_DUMMY_EXAM];

const AIDIFF_THREADS_ENDPOINT = '/aidiff_threads';
const AIDIFF_CHAT_COMPLETION = 'chat_completion';

const getDefaultSuggestedPrompts = (
  context: Context,
  teacherHasSections: boolean,
  teacherHasSectionWithCurriculum: boolean,
  teacherHasSectionWithStudents: boolean
) =>
  context.type === AiDiffContext.GENERAL
    ? SUGGESTED_PROMPTS_FOR_SELECTION['support'].suggestedPrompts.filter(
        ({label}) => {
          // Hide some new thread default prompts based on teacher's sections
          if (
            (label === GET_STARTED_PROMPT.label ||
              label === CREATE_SECTION_PROMPT.label) &&
            teacherHasSections &&
            teacherHasSectionWithCurriculum &&
            teacherHasSectionWithStudents
          ) {
            return false;
          }

          if (
            label === SUGGEST_CURRICULUM_PROMPT.label &&
            teacherHasSectionWithCurriculum
          ) {
            return false;
          }

          return true;
        }
      )
    : SUGGESTED_PROMPTS_FOR_SELECTION['default'].suggestedPrompts;

interface AiDiffChatProps {
  context: Context;
  threadMessages?: ChatItem[];
  threadTitle?: string;
  setThreadTitle?: Dispatch<SetStateAction<string>>;
  scriptName?: string;
  chatResponseCallback?: () => void;
  initialChatMessage?: string;
  suggestedPrompts?: ChatPrompt[];
  hideChatHeader?: boolean;
  curriculumCourses?: string[];
  threadFetchCallback?: () => void;
  threadId?: number;
  setThreadId?: Dispatch<SetStateAction<number>>;
  initialThreadPrompt?: ChatPrompt | null;
  setInitialThreadPrompt?: Dispatch<SetStateAction<ChatPrompt | null>>;
  personalizationData?: PersonalizationData;
}

const AiDiffChat: React.FC<AiDiffChatProps> = ({
  context,
  threadMessages = [],
  threadTitle = defaultThreadTitle,
  setThreadTitle,
  scriptName,
  chatResponseCallback = () => {},
  initialChatMessage = SUGGESTED_PROMPTS_FOR_SELECTION['default']
    .initialMessage,
  suggestedPrompts,
  hideChatHeader = false,
  curriculumCourses = [],
  threadFetchCallback = () => {},
  threadId = 0,
  setThreadId = () => {},
  initialThreadPrompt = null,
  setInitialThreadPrompt = () => {},
  personalizationData,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const reportingData = React.useMemo(() => {
    return {
      chatContext: context,
      scriptName,
    };
  }, [context, scriptName]);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [localThreadId, setLocalThreadId] = useState(threadId);

  const userMessageEditorRef = useRef<HTMLTextAreaElement>(null);

  const viewAsUserId = useAppSelector(
    state => state.progress?.viewAsUserId || undefined
  );

  const teacherSections = Object.values(
    useAppSelector(state => state.teacherSections.sections)
  );
  const teacherHasSections = teacherSections.length > 0;
  const teacherHasSectionWithCurriculum = !!teacherSections.find(
    section => section.courseId !== null
  );
  const teacherHasSectionWithStudents = !!teacherSections.find(
    section => section.studentCount > 0
  );

  const additionalPrompts: ChatPrompt[] = [];
  if (curriculumCourses.includes('csp')) {
    additionalPrompts.push(...APCSP_PROMPTS);
  }
  if (context.type === AiDiffContext.LEVEL) {
    additionalPrompts.push(
      contextPrompts.code.DEBUG_THIS_CODE,
      contextPrompts.code.IMPROVE_THIS_CODE
    );
  }

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>(
    threadMessages.length > 0
      ? threadMessages
      : [
          {
            role: Role.ASSISTANT,
            chatMessageText: initialChatMessage,
            status: Status.OK,
          },
          (
            suggestedPrompts ||
            getDefaultSuggestedPrompts(
              context,
              teacherHasSections,
              teacherHasSectionWithCurriculum,
              teacherHasSectionWithStudents
            )
          ).concat(additionalPrompts),
        ]
  );

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

      if (localThreadId !== 0) {
        sendChatEvent(Role.USER, prompt, isPreset, localThreadId);
      }

      const endpoint =
        localThreadId === 0
          ? `${AIDIFF_THREADS_ENDPOINT}`
          : `${AIDIFF_THREADS_ENDPOINT}/${localThreadId}/${AIDIFF_CHAT_COMPLETION}`;

      const body = JSON.stringify({
        inputText: prompt,
        isPreset,
        presetChipText,
        ...(localThreadId === 0 ? {context} : {}),
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

          // logging here because on the first user message the threadID is 0
          // we only get a threadID initialized in the response
          if (localThreadId === 0) {
            threadFetchCallback();
            sendChatEvent(Role.USER, prompt, isPreset, json.thread_id);
          }

          sendChatEvent(
            Role.ASSISTANT,
            json.chat_message_text,
            isPreset,
            json.thread_id
          );
          if (json.thread_id) {
            setLocalThreadId(json.thread_id);
            setThreadId(json.thread_id);
          }
          setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
        })
        .catch(error => console.log(error))
        .finally(() => {
          setIsWaitingForResponse(false);
          chatResponseCallback();
          if (userMessageEditorRef && userMessageEditorRef.current) {
            userMessageEditorRef.current?.focus();
          }
        });
    },
    [
      localThreadId,
      context,
      viewAsUserId,
      sendChatEvent,
      threadFetchCallback,
      setLocalThreadId,
      chatResponseCallback,
      setThreadId,
    ]
  );

  const onMessageSend = React.useCallback(
    (message: string) => {
      const newUserMessage = {
        role: Role.USER,
        chatMessageText: message,
        status: Status.OK,
      };

      if (
        setThreadTitle &&
        (!threadTitle || threadTitle === defaultThreadTitle)
      ) {
        setThreadTitle(message.slice(0, 100));
      }

      setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
      getAIResponse(message, false, null);
      setUserMessage('');
    },
    [threadTitle, getAIResponse, setThreadTitle]
  );

  const onPromptSelect = React.useCallback(
    (prompt: ChatPrompt) => {
      if (
        setThreadTitle &&
        (!threadTitle || threadTitle === defaultThreadTitle)
      ) {
        setThreadTitle(prompt.label);
      }

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
    },
    [getAIResponse, setThreadTitle, threadTitle]
  );

  React.useEffect(() => {
    if (initialThreadPrompt && threadMessages.length === 0 && threadId === 0) {
      const newUserMessage = {
        role: Role.USER,
        chatMessageText: initialThreadPrompt.prompt,
        status: Status.OK,
      };

      setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
      onPromptSelect(initialThreadPrompt);
      setInitialThreadPrompt(null);
    }
  }, [
    initialThreadPrompt,
    threadMessages,
    threadId,
    onPromptSelect,
    setInitialThreadPrompt,
  ]);

  const onSuggestPrompts = (promptType: SuggestPromptsType) => {
    const aiInitialSuggestionsMessage = {
      role: Role.ASSISTANT,
      chatMessageText:
        SUGGESTED_PROMPTS_FOR_SELECTION[promptType].initialMessage,
      status: Status.OK,
    };
    const newSuggestions =
      SUGGESTED_PROMPTS_FOR_SELECTION[promptType].suggestedPrompts;

    setMessageHistory(prevMessages => [
      ...prevMessages,
      aiInitialSuggestionsMessage,
      newSuggestions,
    ]);
  };

  // Scroll to bottom of content when a new message comes in
  const chatWindowRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current?.scrollIntoView();
    }
  }, [messageHistory]);

  return (
    <div className={style.chatContainer}>
      {!hideChatHeader && (
        <AiDiffChatHeader
          onSuggestPrompts={onSuggestPrompts}
          messages={messageHistory}
          threadTitle={threadTitle}
          personalizationData={personalizationData}
        />
      )}
      <div className={style.chatContent}>
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
        <div ref={chatWindowRef}>
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
      </div>
      <AiDiffChatFooter
        userMessage={userMessage}
        onChange={setUserMessage}
        onSubmit={onMessageSend}
        waiting={isWaitingForResponse}
        userMessageEditorRef={userMessageEditorRef}
      />
    </div>
  );
};

export default AiDiffChat;
