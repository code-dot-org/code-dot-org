import React from 'react';

import styles from './Guide.module.scss';

interface GuideProps {
  id?: string;
  children: React.ReactNode;
}

const Guide: React.FunctionComponent<GuideProps> = ({id, children}) => {
  return (
    <div id={id} className={styles.guide}>
      {children}
    </div>
  );
};

export default Guide;
