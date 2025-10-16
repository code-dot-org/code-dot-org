import classNames from 'classnames';
import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
  width?: 'normal' | 'narrow';
  glowSpeed?: 'normal' | 'fast';
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({
  id,
  children,
  width,
  glowSpeed,
}) => {
  return (
    <div
      id={id}
      className={classNames(
        styles.guide,
        width === 'narrow' ? styles.guideNarrowWidth : styles.guideNormalWidth,
        glowSpeed === 'fast'
          ? styles.guideFastGlowSpeed
          : glowSpeed === 'normal'
          ? styles.guideNormalGlowSpeed
          : undefined
      )}
    >
      <div className={styles.guideInner}>{children}</div>
    </div>
  );
};

export default Guide;
