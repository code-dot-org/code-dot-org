import classNames from 'classnames';
import React from 'react';

import ThinkingDots from '@cdo/apps/aiTutor/views/lessonDeepDive/Animations/ThinkingDots';

import moduleStyles from './TutorWaitingAnimation.module.scss';

export const TutorWaitingAnimation: React.FunctionComponent<{
  shouldDisplay: boolean;
  className?: string;
}> = ({shouldDisplay, className}) =>
  shouldDisplay ? (
    <div
      className={classNames(moduleStyles.waiting, className)}
      role="img"
      aria-label="Tutor is thinking"
    >
      <ThinkingDots size={24} />
    </div>
  ) : null;

export default TutorWaitingAnimation;
