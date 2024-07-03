import classnames from 'classnames';
import React, {useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import Button from '@cdo/apps/componentLibrary/button';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import style from './ai-component.module.scss';

interface AIDiffContainerProps {
  closeTutor?: () => void;
  open: boolean;
}

const AIDiffContainer: React.FC<AIDiffContainerProps> = ({
  closeTutor,
  open,
}) => {
  // TODO: Update to support i18n
  const aiDiffHeaderText = 'AI Teaching Assistant';

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

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
              alt={aiDiffHeaderText}
            />
            <span>{aiDiffHeaderText}</span>
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

        <div className={style.fabBackground} />
      </div>
    </Draggable>
  );
};

export default AIDiffContainer;
