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
  label: 'Give me an example',
  prompt:
    'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
};

export const FINISH_EARLY_PROMPT = {
  label: 'Write an extension activity for students who finish early',
  prompt:
    'Write an extension activity for this lesson for students who finish early',
};

export const EXTRA_PRACTICE_PROMPT = {
  label: 'Write an extension activity for extra practice',
  prompt:
    'Write an extension activity for this lesson for students who need extra practice',
};

export const EXIT_TICKET_PROMPT = {
  label: 'Write an exit ticket',
  prompt:
    'I need an exit ticket to quickly assess if my class understood a concept. You can ask me a follow-up question to find out what concept needs to be assessed and if they have a preference in question type.',
};

export const MINI_LESSON_PROMPT = {
  label: 'Generate a mini lesson',
  prompt: `I need a mini lesson.  You can ask me a follow-up question to find out what concept needs to be assessed and how much time they have. Ask about any known misconceptions in the class. 

    Create a 10-15 (adjust for time based on their answer) minute mini-lesson on [use the topic given by the teacher] for teaching computer science. Include:
    1. An engaging hook that connects to students' real-world experiences
    2. A clear, specific learning objective that can be achieved in this timeframe
    3. A step-by-step demonstration that shows your thought process
    4. At least two points of student interaction or checks for understanding
    5. One common misconception or error to address (use the misconception they provide)
    6. A 2-3 minute practice exercise that lets students apply the concept immediately

    Focus on a single, specific concept that students can understand and practice right away. Keep explanations concise and student-friendly.`,
};

export const LESSON_HOOK_PROMPT = {
  label: 'Write a lesson hook',
  prompt: `I need a lesson hook to engage students on a topic. You can write a message asking teachers for the essential context needed to create an engaging lesson hook. The message should:
    - Request student age/grade level
    - Ask about student interests and hobbies
    - Ask about recent class topics or context
    - Ask about the specific concept being introduced
    Use this information to create a relevant, 1-2 minute hook that connects to students' experiences and creates curiosity about the new concept.

    Format the questions as a clear, easy-to-read list`,
};

export const ADJUST_TIMING_PROMPT = {
  label: 'Adjust curriculum for timing',
  prompt: `I need to adjust a lesson for a different amount of instructional time.  You can clarify what lesson and how much time I have.

    Help me adapt my lesson on [topic given by teacher] to fit a [time period given by teacher] class. I need to preserve the key learning objectives while adjusting the activities and pacing. Please suggest which components to prioritize, what could be condensed or expanded, and provide a minute-by-minute breakdown that includes introduction, instruction, guided practice, independent work, and closure. Include time-saving tips and contingency options if activities run long or short.'`,
};

export const DEBUG_MISTAKES_PROMPT = {
  label: 'Debug common mistakes',
  prompt:
    'Outline the most common mistakes students make when learning key topics in this curriculum at this grade level, provide code examples of these mistakes, and suggest teaching strategies to prevent and address them. Include how to turn these mistakes into learning opportunities and specific questions to ask students to guide their debugging process.',
};

export const REAL_WORLD_PROMPT = {
  label: 'Real world connection',
  prompt: `I need real world connections to the curriculum I am teaching.  Feel free to clarify what concept we are creating real world connections to. 

    Create engaging examples that connect [topic given by user] to real-world applications students care about. Consider target age of curriculum as well as current technology trends, popular apps, games, and everyday problems that can be solved using this concept. Include discussion prompts that help students see how this concept is used in technology they interact with daily students to guide their debugging process.`,
};

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
  suggestedPrompts = SUGGESTED_PROMPTS[0],
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

  const [suggestionPage, setSuggestionPage] = useState(0);

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
    const nextPage = (suggestionPage + 1) % SUGGESTED_PROMPTS.length;
    setSuggestionPage(nextPage);
    setMessageHistory(prevMessages => [
      ...prevMessages,
      SUGGESTED_PROMPTS[nextPage],
    ]);
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
