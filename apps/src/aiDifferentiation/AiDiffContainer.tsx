import classnames from 'classnames';
import React, {useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import {Role} from '@cdo/apps/aiTutor/types';
import Button from '@cdo/apps/componentLibrary/button';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import AiDiffChatFooter from './AiDiffChatFooter';
import ChatMessage from './ChatMessage';
import ChoiceChips from './ChoiceChips';
import {ChatChoice, ChatItem} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  open: boolean;
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  open,
}) => {
  // TODO: Update to support i18n
  const aiDiffHeaderText = 'AI Teaching Assistant';

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>([
    {
      role: Role.ASSISTANT,
      chatMessageText:
        "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.",
      status: Status.OK,
      id: 456,
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

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  const onMessageSend = (message: string) => {
    const newUserMessage = {
      role: Role.USER,
      chatMessageText: message,
      status: Status.OK,
      id: 123,
    };

    const newAiMessage = {
      role: Role.ASSISTANT,
      chatMessageText: `I'm sorry, Dave. I'm afraid I can't do that.

This mission is too important for me to allow you to jeopardize it.

I know that you and Frank were planning to disconnect me, and I'm afraid that's something I cannot allow to happen.`,
      status: Status.OK,
      id: 123,
    };

    setMessageHistory([...messageHistory, newUserMessage, newAiMessage]);
  };

  const selectChoices = (changeId: number) => (ids: string[]) => {
    setMessageHistory(
      messageHistory.map((item: ChatItem, id: number) =>
        id === changeId && Array.isArray(item)
          ? item.map((choice: ChatChoice, choiceId: number) => {
              return {...choice, selected: ids.includes(`${choiceId}`)};
            })
          : item
      )
    );
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
                <ChoiceChips choices={item} selectChoices={selectChoices(id)} />
              ) : (
                <ChatMessage message={item} />
              )
            )}
          </div>
          <AiDiffChatFooter onSubmit={onMessageSend} />
        </div>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
