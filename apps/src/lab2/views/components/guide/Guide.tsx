import classNames from 'classnames';
import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
  width?: 'normal' | 'narrow';
  position?: 'normal' | 'bottom';
  modal?: 'full' | 'gap';
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({
  id,
  children,
  width,
  position,
  modal,
}) => {
  return (
    <div
      id={id ? `${id}-container` : undefined}
      className={
        modal === 'gap'
          ? classNames(
              styles.guideContainerModal,
              styles.guideContainerModalGap
            )
          : modal === 'full'
          ? styles.guideContainerModal
          : undefined
      }
    >
      <div
        id={id}
        className={classNames(
          styles.guide,
          width === 'narrow'
            ? styles.guideNarrowWidth
            : styles.guideNormalWidth,
          position === 'bottom'
            ? styles.guideBottomPosition
            : styles.guideNormalPosition,
          modal === 'gap' && styles.guideGap
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Guide;
