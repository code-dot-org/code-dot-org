import React, {useEffect, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import {useAppSelector} from '../util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffChat from './AiDiffChat';

import style from './ai-differentiation.module.scss';

const AI_DIFF_POSITION_X = 'aiDiffPositionX';
const AI_DIFF_POSITION_Y = 'aiDiffPositionY';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  open: boolean;
  lessonId: number;
  lessonName: string;
  unitDisplayName: string;
  disableWelcome?: boolean;
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  open,
  lessonId,
  lessonName,
  unitDisplayName,
  // TODO(lfm): remove this when welcome is ready to be shown.
  disableWelcome = true,
}) => {
  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_X, 0)) || 0
  );
  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_Y, 0)) || 0
  );

  const hasCompletedAiDifferentiationWelcome = useAppSelector(
    state => state.currentUser.hasCompletedAiDifferentiationWelcome
  );
  console.log('lfm1', hasCompletedAiDifferentiationWelcome);

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
        {!disableWelcome && !hasCompletedAiDifferentiationWelcome ? (
          <div>This is the welcome experience for AI differentiation</div>
        ) : (
          <AiDiffChat
            closeTutor={closeTutor}
            lessonId={lessonId}
            lessonName={lessonName}
            unitDisplayName={unitDisplayName}
          />
        )}
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
