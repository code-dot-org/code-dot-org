import React, {useEffect, useRef, useState} from 'react';

import {
  setThreadId,
  addThreadMessage,
  setThreadTitle,
} from '@cdo/apps/aichat/redux/slice';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
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
import {SUGGESTED_PROMPTS_FOR_SELECTION} from './AiDiffPredefinedPrompts';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {DEFAULT_THREAD_TITLE} from './constants';
import {ChatItem, ChatPrompt, Context, SuggestPromptsType} from './types';

import style from './ai-differentiation.module.scss';

const AIDIFF_THREADS_ENDPOINT = '/aidiff_threads';
const AIDIFF_CHAT_COMPLETION = 'chat_completion';

interface AiDiffChatProps {
  context: Context;
  scriptName?: string;
  chatResponseCallback?: () => void;
  hideChatHeader?: boolean;
  threadFetchCallback?: () => void;
  personalizationData?: PersonalizationData;
}

const AiDiffChat: React.FC<AiDiffChatProps> = ({
  context,
  scriptName,
  chatResponseCallback = () => {},
  hideChatHeader = false,
  threadFetchCallback = () => {},
  personalizationData,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const [hasSentInitialPrompt, setHasSentInitialPrompt] =
    useState<boolean>(false);
  const reportingData = React.useMemo(() => {
    return {
      chatContext: context,
      scriptName,
    };
  }, [context, scriptName]);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const userMessageEditorRef = useRef<HTMLTextAreaElement>(null);

  const viewAsUserId = useAppSelector(
    state => state.progress?.viewAsUserId || undefined
  );

  const threadId = useAppSelector(state => state.aichat.threadId);
  const threadTitle = useAppSelector(state => state.aichat.threadTitle);
  const initialThreadPrompt = useAppSelector(
    state => state.aichat.initialThreadPrompt
  );
  const threadMessages = useAppSelector(state => state.aichat.threadMessages);

  const dispatch = useAppDispatch();

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

      if (threadId !== 0) {
        sendChatEvent(Role.USER, prompt, isPreset, threadId);
      }

      const endpoint =
        threadId === 0
          ? `${AIDIFF_THREADS_ENDPOINT}`
          : `${AIDIFF_THREADS_ENDPOINT}/${threadId}/${AIDIFF_CHAT_COMPLETION}`;

      const body = JSON.stringify({
        inputText: prompt,
        isPreset,
        presetChipText,
        ...(threadId === 0 ? {context} : {}),
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
          if (threadId === 0) {
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
            dispatch(setThreadId(json.thread_id));
          }
          dispatch(addThreadMessage(newAiMessage));
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
      threadId,
      context,
      viewAsUserId,
      sendChatEvent,
      dispatch,
      threadFetchCallback,
      chatResponseCallback,
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
        (!threadTitle || threadTitle === DEFAULT_THREAD_TITLE)
      ) {
        dispatch(setThreadTitle(message.slice(0, 100)));
      }

      dispatch(addThreadMessage(newUserMessage));
      getAIResponse(message, false, null);
      setUserMessage('');
    },
    [threadTitle, dispatch, getAIResponse]
  );

  const onPromptSelect = React.useCallback(
    (prompt: ChatPrompt) => {
      if (
        setThreadTitle &&
        (!threadTitle || threadTitle === DEFAULT_THREAD_TITLE)
      ) {
        dispatch(setThreadTitle(prompt.label));
      }

      if (prompt.response !== undefined) {
        dispatch(
          addThreadMessage({
            role: Role.ASSISTANT,
            chatMessageText: prompt.response ?? '',
            status: Status.OK,
          })
        );
      }
      if (prompt.followUpPrompts !== undefined) {
        dispatch(addThreadMessage(prompt.followUpPrompts));
      }
      if (!prompt.followUpPrompts && !prompt.response) {
        getAIResponse(prompt.prompt, true, prompt.label);
      }
    },
    [dispatch, getAIResponse, threadTitle]
  );

  React.useEffect(() => {
    if (initialThreadPrompt && threadId === 0 && !hasSentInitialPrompt) {
      setHasSentInitialPrompt(true);
      onPromptSelect(initialThreadPrompt);
    }
  }, [initialThreadPrompt, threadId, hasSentInitialPrompt, onPromptSelect]);

  const onSuggestPrompts = (promptType: SuggestPromptsType) => {
    const aiInitialSuggestionsMessage = {
      role: Role.ASSISTANT,
      chatMessageText:
        SUGGESTED_PROMPTS_FOR_SELECTION[promptType].initialMessage,
      status: Status.OK,
    };
    const newSuggestions =
      SUGGESTED_PROMPTS_FOR_SELECTION[promptType].suggestedPrompts;

    dispatch(addThreadMessage(aiInitialSuggestionsMessage));
    dispatch(addThreadMessage(newSuggestions));
  };

  // Scroll to bottom of content when a new message comes in
  const chatWindowRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current?.scrollIntoView();
    }
  }, [threadMessages]);

  return (
    <div className={style.chatContainer}>
      {!hideChatHeader && (
        <AiDiffChatHeader
          onSuggestPrompts={onSuggestPrompts}
          messages={threadMessages}
          threadTitle={threadTitle}
          personalizationData={personalizationData}
        />
      )}
      <div className={style.chatContent}>
        {threadMessages.map((item: ChatItem, id: number) =>
          Array.isArray(item) ? (
            <AiDiffSuggestedPrompts
              suggestedPrompts={item}
              isLatest={id === threadMessages.length - 1}
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
