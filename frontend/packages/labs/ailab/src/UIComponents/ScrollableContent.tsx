import type {ReactNode} from 'react';

import styles from './scrollableContent.module.scss';

interface ScrollableContentProps {
  tinted?: boolean;
  children?: ReactNode;
}

const ScrollableContent = ({tinted, children}: ScrollableContentProps) => {
  return (
    <div className={tinted ? styles.tinted : styles.plain}>
      <div className={styles.scrolling}>{children}</div>
    </div>
  );
};

export default ScrollableContent;
