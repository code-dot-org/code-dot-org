import classNames from 'classnames';
import React from 'react';

import moduleStyles from './WaitingAnimation.module.scss';

export const WaitingAnimation: React.FunctionComponent<{
  shouldDisplay: boolean;
  className?: string;
}> = ({shouldDisplay, className}) => {
  if (shouldDisplay) {
    return (
      <div className={classNames(moduleStyles.waiting, className)}>
        <div className={moduleStyles.dot} />
        <div className={moduleStyles.dot} />
        <div className={moduleStyles.dot} />
      </div>
    );
  }

  return null;
};

export default WaitingAnimation;
