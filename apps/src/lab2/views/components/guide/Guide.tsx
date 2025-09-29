import classNames from 'classnames';
import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
  width?: 'normal' | 'narrow';
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({id, children, width}) => {
  return (
    <div
      id={id}
      className={classNames(
        styles.guide,
        width === 'narrow' ? styles.guideNarrow : styles.guideNormal
      )}
    >
      {children}
    </div>
  );
};

export default Guide;
