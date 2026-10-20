import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface SheetProps {
  title: string;
  id?: string;
  /** Slid off to the side rather than hidden, so a dialog rendered inside
      it still shows. */
  closed?: boolean;
  onDone: () => void;
  children: React.ReactNode;
}

/**
 * A panel over the whole area under the scene row, named at the top with a
 * Done button beside the name.
 */
const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({title, id, closed = false, onDone, children}, ref) => (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-label={title}
      className={classNames(
        moduleStyles.sheet,
        closed && moduleStyles.sheetClosed
      )}
    >
      <div className={moduleStyles.sheetHeader}>
        <span>{title}</span>
        <MuiButton
          variant="outlined"
          color="secondary"
          size="small"
          onClick={onDone}
        >
          Done
        </MuiButton>
      </div>
      <div className={moduleStyles.sheetBody}>{children}</div>
    </div>
  )
);
Sheet.displayName = 'Sheet';

export default Sheet;
