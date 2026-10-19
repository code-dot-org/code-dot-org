import React, {type ReactNode} from 'react';

import styles from './dataTableFrame.module.scss';

type DataTableFrameProps = {
  children: ReactNode;
} & ({label: string; labelId?: never} | {labelId: string; label?: never});

// The scroller is the frame's focused child so the focus ring paints above sticky headers.
const DataTableFrame = ({children, label, labelId}: DataTableFrameProps) => (
  <div className={styles.frame}>
    <div
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so a keyboard can scroll a wide table
      tabIndex={0}
      role="group"
      aria-label={label}
      aria-labelledby={labelId}
      className={styles.scroller}
    >
      {children}
    </div>
  </div>
);

export default DataTableFrame;
