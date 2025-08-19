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

  const showSidebar = experiments.isEnabled(experiments.AI_DIFF_SIDEBAR);

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
        className={
          showSidebar &&
          !(!hasCompletedAiDifferentiationWelcome && showWelcomeExperience) //don't use wide container for welcome
            ? style.aiDiffContainerWide
            : style.aiDiffContainer
        }
        style={open ? undefined : {display: 'none'}}
      >
        <FocusLock>
          <AiDiffHeader closeTutor={closeTutor} />
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
