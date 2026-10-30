import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './zoomControls.module.scss';

interface ZoomControlsProps {
  /** The zoom percentages to step through, smallest first. */
  zoomPercentages: readonly number[];
  /** Index into zoomPercentages. */
  level: number;
  /** The level the reset button returns to; it shows only away from it. */
  resetLevel: number;
  onChange: (level: number) => void;
  /** Places the column; it has no position of its own. */
  className?: string;
}

/** A column of zoom in, zoom out and reset buttons for a map. */
const ZoomControls: React.FunctionComponent<ZoomControlsProps> = ({
  zoomPercentages,
  level,
  resetLevel,
  onChange,
  className,
}) => (
  <div className={classNames(styles.zoomControls, className)}>
    <IconButton
      size="small"
      aria-label="Zoom in"
      disabled={level === zoomPercentages.length - 1}
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
    {level !== resetLevel && (
      <IconButton
        size="small"
        aria-label="Reset zoom"
        onClick={() => onChange(resetLevel)}
      >
        <FontAwesomeV6Icon iconName="expand" />
      </IconButton>
    )}
  </div>
);

export default ZoomControls;
