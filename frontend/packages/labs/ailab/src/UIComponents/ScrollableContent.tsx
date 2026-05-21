import {ReactNode} from 'react';
import {styles} from '../constants';

interface ScrollableContentProps {
  tinted?: boolean;
  children?: ReactNode;
}

const ScrollableContent = ({tinted, children}: ScrollableContentProps) => {
  return (
    <div
      style={
        tinted ? styles.scrollableContentsTinted : styles.scrollableContents
      }
    >
      <div style={styles.scrollingContents}>{children}</div>
    </div>
  );
};

export default ScrollableContent;
