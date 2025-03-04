import React, {useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';

import AiDiffBotMessageFooter from './AiDiffBotMessageFooter';
import AiDiffChatFooter from './AiDiffChatFooter';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {ChatItem, ChatPrompt} from './types';

import style from './ai-differentiation.module.scss';

const INITIAL_CHAT_MESSAGE = `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`;

export const EXPLAIN_CONCEPT_PROMPT = {
  label: 'Explain a concept',
  prompt:
    'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
};

export const EXAMPLE_PROMPT = {
  label: 'Give an example to use with my class',
  prompt:
    'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
};

export const FINISH_EARLY_PROMPT = {
  label: 'Write an extension activity for students who finish early',
  prompt:
    'Write an extension activity for this lesson for students who finish early',
};

export const EXTRA_PRACTICE_PROMPT = {
  label: 'Write an extension activity for students who need extra practice',
  prompt:
    'Write an extension activity for this lesson for students who need extra practice',
};

const SUGGESTED_PROMPTS = [
  EXPLAIN_CONCEPT_PROMPT,
  EXAMPLE_PROMPT,
  FINISH_EARLY_PROMPT,
  EXTRA_PRACTICE_PROMPT,
];

const AI_DIFF_CHAT_MESSAGE_ENDPOINT = '/ai_diff/chat_completion';

interface AiDiffChatProps {
  context: string;
  scriptId: number;
  scriptName: string;
  unitDisplayName: string;
  chatResponseCallback?: () => void;
  initialChatMessage?: string;
  suggestedPrompts?: ChatPrompt[];
  disableEndButtons?: boolean;
}

const AiDiffChat: React.FC<AiDiffChatProps> = ({
  context,
  scriptId,
  scriptName,
  unitDisplayName,
  chatResponseCallback = () => {},
  initialChatMessage = INITIAL_CHAT_MESSAGE,
  suggestedPrompts = SUGGESTED_PROMPTS,
  disableEndButtons = false,
}) => {
  const reportingData = React.useMemo(() => {
    return {
      chatContext: context,
      scriptId: scriptId,
      scriptName: scriptName,
      unitName: unitDisplayName,
    };
  }, [context, scriptId, scriptName, unitDisplayName]);

  const [sessionId, setSessionId] = useState(null);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>([
    {
      role: Role.ASSISTANT,
      chatMessageText: initialChatMessage,
      status: Status.OK,
    },
    suggestedPrompts,
  ]);

  const onMessageSend = (message: string) => {
    const newUserMessage = {
      role: Role.USER,
      chatMessageText: message,
      status: Status.OK,
    };

    setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
    getAIResponse(message, false);
  };

  const onPromptSelect = (prompt: ChatPrompt) => {
    getAIResponse(prompt.prompt, true);
  };

  const onSuggestPrompts = () => {
    setMessageHistory(prevMessages => [...prevMessages, suggestedPrompts]);
  };

  const sendChatEvent = React.useCallback(
    (role: string, prompt: string, preset: boolean, session: string) => {
      const responseEventData = {
        ...reportingData,
        role: role,
        isPreset: preset,
        text: prompt,
        sessionId: session,
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
    (prompt: string, isPreset: boolean) => {
      setIsWaitingForResponse(true);

      if (sessionId !== null) {
        sendChatEvent(Role.USER, prompt, isPreset, sessionId);
      }

      const body = JSON.stringify({
        context: context,
        inputText: prompt,
        contextId: scriptId,
        unitDisplayName: unitDisplayName,
        sessionId: sessionId,
        isPreset: isPreset,
      });
      HttpClient.post(`${AI_DIFF_CHAT_MESSAGE_ENDPOINT}`, body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then(json => {
          const newAiMessage = {
            role: Role.ASSISTANT,
            chatMessageText: json.chat_message_text,
            status: json.status,
          };

          // logging here because on the first user message the sessionId is null
          // we only get a sessionID initialized in the response
          if (sessionId === null) {
            sendChatEvent(Role.USER, prompt, isPreset, json.session_id);
          }

          sendChatEvent(
            Role.ASSISTANT,
            json.chat_message_text,
            isPreset,
            json.session_id
          );
          setSessionId(json.session_id);
          setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
        })
        .catch(error => console.log(error))
        .finally(() => {
          setIsWaitingForResponse(false);
          chatResponseCallback();
        });
    },
    [
      context,
      scriptId,
      unitDisplayName,
      sessionId,
      chatResponseCallback,
      sendChatEvent,
    ]
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
                  <AiDiffBotMessageFooter message={item} />
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
