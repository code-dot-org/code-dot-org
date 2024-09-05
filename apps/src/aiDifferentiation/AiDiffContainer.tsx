import classnames from 'classnames';
import React, {useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Button from '@cdo/apps/componentLibrary/button';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import HttpClient from '../util/HttpClient';

import AiDiffChatFooter from './AiDiffChatFooter';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {ChatItem, ChatPrompt} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  open: boolean;
  lessonId: number;
  unitDisplayName: string;
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  open,
  lessonId,
  unitDisplayName,
}) => {
  // TODO: Update to support i18n
  const aiDiffHeaderText = 'AI Teaching Assistant';

  const aiDiffChatMessageEndpoint = '/ai_diff/chat_completion';

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const [sessionId, setSessionId] = useState(null);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>([
    {
      role: Role.ASSISTANT,
      chatMessageText: `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`,
      status: Status.OK,
    },
    [
      {
        label: 'Explain a concept',
        prompt:
          'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
      },
      {
        label: 'Give an example to use with my class',
        prompt:
          'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
      },
      {
        label: 'Write an extension activity for students who finish early',
        prompt:
          'Write an extension activity for this lesson for students who finish early',
      },
      {
        label:
          'Write an extension activity for students who need extra practice',
        prompt:
          'Write an extension activity for this lesson for students who need extra practice',
      },
    ],
  ]);

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  const onMessageSend = (message: string) => {
    const newUserMessage = {
      role: Role.USER,
      chatMessageText: message,
      status: Status.OK,
    };

    setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
    setIsWaitingForResponse(true);

    const body = JSON.stringify({
      inputText: message,
      lessonId: lessonId,
      unitDisplayName: unitDisplayName,
      sessionId: sessionId,
    });
    HttpClient.post(`${aiDiffChatMessageEndpoint}`, body, true, {
      'Content-Type': 'application/json',
    })
      .then(response => response.json())
      .then(json => {
        const newAiMessage = {
          role: Role.ASSISTANT,
          chatMessageText: json.chat_message_text,
          status: json.status,
        };
        setSessionId(json.session_id);
        setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
      })
      .catch(error => console.log(error))
      .finally(() => {
        setIsWaitingForResponse(false);
      });
  };

  const onPromptSelect = (prompt: ChatPrompt) => {
    const newAiMessage = {
      role: Role.ASSISTANT,
      chatMessageText: `You selected "${prompt.label}" with prompt "${prompt.prompt}". This is a placeholder response.`,
      status: Status.OK,
    };

    setMessageHistory([...messageHistory, newAiMessage]);
  };

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        className={classnames(style.aiDiffContainer, {
          [style.hiddenAiDiffPanel]: !open,
        })}
      >
        <div className={style.aiDiffHeader}>
          <div className={style.aiDiffHeaderLeftSide}>
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={aiDiffHeaderText}
            />
            <span>{aiDiffHeaderText}</span>
          </div>
          <div className={style.aiDiffHeaderRightSide}>
            <Button
              color="white"
              icon={{iconName: 'times', iconStyle: 'solid'}}
              type="tertiary"
              isIconOnly={true}
              onClick={closeTutor}
              size="s"
            />
          </div>
        </div>

        <div className={style.fabBackground}>
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
                <ChatMessage {...item} key={id} />
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
          <AiDiffChatFooter onSubmit={onMessageSend} />
        </div>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
