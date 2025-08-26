import React, {useEffect, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';
import FocusLock from 'react-focus-lock';

import experiments from '@cdo/apps/util/experiments';

import {useAppSelector} from '../util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffHeader from './AiDiffHeader';
import AiDiffWorkSpace from './AiDiffWorkspace';
import {Context} from './types';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

const AI_DIFF_POSITION_X = 'aiDiffPositionX';
const AI_DIFF_POSITION_Y = 'aiDiffPositionY';
interface AiDiffContainerProps {
  closeTutor?: () => void;
  context: Context;
  open: boolean;
  scriptName?: string;
  curriculumCourses?: string[];
}

const MIN_VISIBLE = 40;
const boxWidth = parseInt(style.containerWidth);
const originX = parseInt(style.fabOriginX);
// These isNaN checks are for testing as the SCSS variables don't come
// through properly in the test environment.
const minX = isNaN(originX) ? 0 : MIN_VISIBLE - originX - boxWidth;
const maxX = isNaN(originX)
  ? 1000
  : document.documentElement.clientWidth - originX - MIN_VISIBLE;

const boxHeight = parseInt(style.containerHeight);
const originY = parseInt(style.fabOriginY);
// These isNaN checks are for testing as the SCSS variables don't come
// through properly in the test environment.
const minY = isNaN(originY)
  ? 0
  : originY - document.documentElement.clientHeight + boxHeight;
const maxY = isNaN(originY) ? 1000 : originY + boxHeight - MIN_VISIBLE;

const AI_DIFF_CLOSE_BUTTON_CLASSNAME = 'ai_diff_close_button';

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  context,
  open,
  scriptName,
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
      if (positionX < minX) {
        setPositionX(minX);
      } else if (positionX > maxX) {
        setPositionX(maxX);
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
      if (positionY < minY) {
        setPositionY(minY);
      } else if (positionY > maxY) {
        setPositionY(maxY);
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

  const showSidebar = experiments.isEnabled(experiments.AI_DIFF_SIDEBAR);

  return (
    <Draggable
      handle=".ai_diff_handle"
      position={{x: positionX, y: positionY}}
      onStop={onStopHandler}
      cancel={`.${AI_DIFF_CLOSE_BUTTON_CLASSNAME}`}
    >
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid="draggable-test-id"
        id="draggable-id"
        className={
          showSidebar &&
          !(!hasCompletedAiDifferentiationWelcome && showWelcomeExperience) //don't use wide container for welcome
            ? style.aiDiffContainerWide
            : style.aiDiffContainer
        }
        style={open ? undefined : {display: 'none'}}
      >
        <FocusLock>
          <AiDiffHeader
            closeTutor={closeTutor}
            closeButtonClassName={AI_DIFF_CLOSE_BUTTON_CLASSNAME}
          />
          <div className={style.fabBackground}>
            {!hasCompletedAiDifferentiationWelcome && showWelcomeExperience
              ? curriculumCourses && (
                  <AiDiffWelcome
                    setShowWelcomeExperience={setShowWelcomeExperience}
                    context={context}
                    scriptName={scriptName}
                    curriculumCourses={curriculumCourses}
                  />
                )
              : curriculumCourses && (
                  <AiDiffWorkSpace
                    context={context}
                    scriptName={scriptName}
                    curriculumCourses={curriculumCourses}
                    showSidebar={showSidebar}
                  />
                )}
          </div>
        </FocusLock>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
