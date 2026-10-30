import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './zoomControls.module.scss';

interface ZoomControlsProps {
  /** The zoom levels to step through, smallest first. */
  levels: readonly number[];
  /** Index into levels. */
  level: number;
  /** The level the reset button returns to. */
  resetLevel: number;
  onChange: (level: number) => void;
  /** Places the column; it has no position of its own. */
  className?: string;
}

/** A column of zoom in, zoom out and reset buttons for a map. */
const ZoomControls: React.FunctionComponent<ZoomControlsProps> = ({
  levels,
  level,
  resetLevel,
  onChange,
  className,
}) => (
  <div className={classNames(styles.zoomControls, className)}>
    <IconButton
      size="small"
      aria-label="Zoom in"
      disabled={level === levels.length - 1}
      onClick={() => onChange(level + 1)}
    >
      <FontAwesomeV6Icon iconName="magnifying-glass-plus" />
    </IconButton>
    <IconButton
      size="small"
      aria-label="Zoom out"
      disabled={level === 0}
      onClick={() => onChange(level - 1)}
    >
      <FontAwesomeV6Icon iconName="magnifying-glass-minus" />
    </IconButton>
    <IconButton
      size="small"
      aria-label="Reset zoom"
      disabled={level === resetLevel}
      onClick={() => onChange(resetLevel)}
    >
      <FontAwesomeV6Icon iconName="expand" />
    </IconButton>
  </div>
);

export default ZoomControls;
