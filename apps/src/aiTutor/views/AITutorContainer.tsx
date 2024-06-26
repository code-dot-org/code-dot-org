import classnames from 'classnames';
import React, {useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import Button from '@cdo/apps/componentLibrary/button';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import AITutorChatWorkspace from './AITutorChatWorkspace';
import AITutorFooter from './AITutorFooter';

import style from './ai-tutor.module.scss';

interface AITutorContainerProps {
  closeTutor?: () => void;
  open: boolean;
}

const AITutorContainer: React.FC<AITutorContainerProps> = ({
  closeTutor,
  open,
}) => {
  // TODO: Update to support i18n
  const aiTutorHeaderText = 'AI Tutor';

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const level = useAppSelector(state => state.aiTutor.level);
  const renderAITutor = !level?.isAssessment && !!level?.aiTutorAvailable;

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        className={classnames(style.aiTutorContainer, {
          [style.hiddenAITutorPanel]: !open,
        })}
      >
        <div className={style.aiTutorHeader}>
          <div className={style.aiTutorHeaderLeftSide}>
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={aiTutorHeaderText}
            />
            <span>{aiTutorHeaderText}</span>
          </div>
          <div className={style.aiTutorHeaderRightSide}>
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
          {renderAITutor ? (
            <AITutorChatWorkspace />
          ) : (
            <h4>You don't have access on this level.</h4>
          )}
        </div>
        <AITutorFooter renderAITutor={renderAITutor} />
      </div>
    </Draggable>
  );
};

export default AITutorContainer;
