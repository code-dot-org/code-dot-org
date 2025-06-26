import Button from '@code-dot-org/component-library/button';
import Tags from '@code-dot-org/component-library/tags';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';
import FocusLock from 'react-focus-lock';

import i18n from '@cdo/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {useAppSelector} from '../util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffChat from './AiDiffChat';
import {Context} from './types';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

const AI_DIFF_POSITION_X = 'aiDiffPositionX';
const AI_DIFF_POSITION_Y = 'aiDiffPositionY';

// TODO: Update to support i18n
const AI_DIFF_HEADER_TEXT = 'AI Teaching Assistant';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  context: Context;
  open: boolean;
  scriptName?: string;
  unitDisplayName?: string;
  curriculumCourses?: string[];
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  context,
  open,
  scriptName,
  unitDisplayName,
  curriculumCourses,
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
    const ensureDraggableIsVisible = () => {
      if (window.innerWidth < positionX + 100) {
        setPositionX(window.innerWidth - 100);
      }
    };
    ensureDraggableIsVisible();
    window.addEventListener('resize', ensureDraggableIsVisible);
    trySetSessionStorage(AI_DIFF_POSITION_X, String(positionX));
    return () => {
      window.removeEventListener('resize', ensureDraggableIsVisible);
    };
  }, [positionX]);

  useEffect(() => {
    const ensureDraggableIsVisible = () => {
      if (positionY + window.innerHeight < 760) {
        setPositionY(760 - window.innerHeight);
      }
    };
    ensureDraggableIsVisible();
    window.addEventListener('resize', ensureDraggableIsVisible);
    trySetSessionStorage(AI_DIFF_POSITION_Y, String(positionY));
    return () => {
      window.removeEventListener('resize', ensureDraggableIsVisible);
    };
  }, [positionY]);

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  return (
    <Draggable
      handle=".ai_diff_handle"
      position={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid="draggable-test-id"
        id="draggable-id"
        className={style.aiDiffContainer}
        style={open ? undefined : {display: 'none'}}
      >
        <FocusLock>
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
              <span>
                <Tags
                  tagsList={[{label: i18n.experiment()}]}
                  size="s"
                  className={style.headerTag}
                />
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
            {!hasCompletedAiDifferentiationWelcome && showWelcomeExperience
              ? curriculumCourses && (
                  <AiDiffWelcome
                    setShowWelcomeExperience={setShowWelcomeExperience}
                    context={context}
                    scriptName={scriptName}
                    unitDisplayName={unitDisplayName}
                    curriculumCourses={curriculumCourses}
                  />
                )
              : curriculumCourses && (
                  <AiDiffChat
                    context={context}
                    scriptName={scriptName}
                    unitDisplayName={unitDisplayName}
                    curriculumCourses={curriculumCourses}
                  />
                )}
          </div>
        </FocusLock>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
