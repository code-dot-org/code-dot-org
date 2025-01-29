import React, {useEffect, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffChat from './AiDiffChat';

import style from './ai-differentiation.module.scss';

const AI_DIFF_POSITION_X = 'aiDiffPositionX';
const AI_DIFF_POSITION_Y = 'aiDiffPositionY';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  context: string;
  open: boolean;
  scriptId: number;
  scriptName: string;
  unitDisplayName: string;
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  context,
  open,
  scriptId,
  scriptName,
  unitDisplayName,
}) => {
  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_X, 0)) || 0
  );
  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_Y, 0)) || 0
  );

  useEffect(() => {
    trySetSessionStorage(AI_DIFF_POSITION_X, String(positionX));
  }, [positionX]);

  useEffect(() => {
    trySetSessionStorage(AI_DIFF_POSITION_Y, String(positionY));
  }, [positionY]);

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  return (
    <Draggable
      handle=".ai_diff_handle"
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid="draggable-test-id"
        id="draggable-id"
        className={style.aiDiffContainer}
        style={open ? undefined : {display: 'none'}}
      >
        <AiDiffChat
          context={context}
          closeTutor={closeTutor}
          scriptId={scriptId}
          scriptName={scriptName}
          unitDisplayName={unitDisplayName}
        />
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
