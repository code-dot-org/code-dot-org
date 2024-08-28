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
import ChoiceChips from './ChoiceChips';
import {ChatChoice, ChatItem} from './types';

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
      chatMessageText: `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.
        lesson id: ${lessonId}
        unit name: ${unitDisplayName}`,
      status: Status.OK,
    },
    [
      {selected: false, text: 'Explain a concept'},
      {selected: false, text: 'Give an example to use with my class'},
      {
        selected: false,
        text: 'Write an extension activity for students who finish early',
      },
      {
        selected: false,
        text: 'Write an extension activity for students who need extra practice',
      },
    ],
  ]);
  const [lastChipSelected, setLastChipSelected] = useState<number>(-1);

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
        console.log(json);
        const newAiMessage = {
          role: Role.ASSISTANT,
          chatMessageText: json.chat_message_text,
          status: json.status,
        };
        setIsWaitingForResponse(false);
        setSessionId(json.session_id);
        setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
      })
      .catch(error => console.log(error));
  };

  const selectChoices = (changeId: number) => (ids: string[]) => {
    // Only allow user to select a chip when those chips were the most recent
    // chat interaction.
    if (changeId !== messageHistory.length - 1) {
      return;
    }

    // Only allow the first selected chip to count.
    if (changeId === lastChipSelected) {
      return;
    }

    setMessageHistory(
      messageHistory.map((item: ChatItem, id: number) =>
        id === changeId && Array.isArray(item)
          ? item.map((choice: ChatChoice, choiceId: number) => {
              return {...choice, selected: ids.includes(`${choiceId}`)};
            })
          : item
      )
    );

    setLastChipSelected(changeId);
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
                <ChoiceChips
                  choices={item}
                  selectChoices={selectChoices(id)}
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
