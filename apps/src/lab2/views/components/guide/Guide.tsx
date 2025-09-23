import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
}

// The Guide is a floating container for instructional content.  It is larger
// and more prominent than our more traditional instructions.  It's named
// for the Guide used for instructions in AI for Oceans.
const Guide: React.FunctionComponent<GuideProps> = ({id, children}) => {
  return (
    <div id={id} className={styles.guide}>
      {children}
    </div>
  );
};

export default Guide;
