// Three dots, while a turn is in flight.
//
// Ported unchanged from `apps/src/aichat/views/WaitingAnimation.tsx`, animation
// and all. It is the only thing the panel shows between a question and its
// answer, and a fixture with a scripted `delayMs` is what makes it visible on
// the demo page without a model.

import classNames from 'classnames';
import type {FC} from 'react';

import moduleStyles from './waiting-animation.module.scss';

export const WaitingAnimation: FC<{className?: string}> = ({className}) => (
  <div
    className={classNames(moduleStyles.waiting, className)}
    role="status"
    aria-label="Waiting for a response"
  >
    <div className={moduleStyles.dot} />
    <div className={moduleStyles.dot} />
    <div className={moduleStyles.dot} />
  </div>
);

export default WaitingAnimation;
