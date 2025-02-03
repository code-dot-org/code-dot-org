import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import Button from '@cdo/apps/componentLibrary/button';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {useAppSelector} from '../util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffChat from './AiDiffChat';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

const AI_DIFF_POSITION_X = 'aiDiffPositionX';
const AI_DIFF_POSITION_Y = 'aiDiffPositionY';

// TODO: Update to support i18n
const AI_DIFF_HEADER_TEXT = 'AI Teaching Assistant';

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
  const [showWelcomeExperience, setShowWelcomeExperience] = useState(true);

  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_X, 0)) || 0
  );
  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(AI_DIFF_POSITION_Y, 0)) || 0
  );

  const hasCompletedAiDifferentiationWelcome = useAppSelector(
    state => state.currentUser.hasCompletedAiDifferentiationWelcome
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
        <div className={classNames(style.aiDiffHeader, 'ai_diff_handle')}>
          <div className={style.aiDiffHeaderLeftSide}>
            <div className={style.aiBotHeader}>
              <img
                src={aiBotOutlineIcon}
                className={style.aiBotOutlineIcon}
                alt={AI_DIFF_HEADER_TEXT}
              />
              <div className={style.taOverlayHeader}>
                <span>{'TA'}</span>
              </div>
            </div>
            <span className={style.aiDiffHeaderText}>
              {AI_DIFF_HEADER_TEXT}
            </span>
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
          {!disableWelcome &&
          !hasCompletedAiDifferentiationWelcome &&
          showWelcomeExperience ? (
            <AiDiffWelcome
              setShowWelcomeExperience={setShowWelcomeExperience}
              lessonId={lessonId}
              lessonName={lessonName}
              unitDisplayName={unitDisplayName}
            />
          ) : (
            <AiDiffChat
              lessonId={lessonId}
              lessonName={lessonName}
              unitDisplayName={unitDisplayName}
            />
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
