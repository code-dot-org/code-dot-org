import {IconButton, Tooltip} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './siteControls.module.scss';

/**
 * window.codeaiZoom, which the app's page script defines in debug builds of
 * the app only.
 */
export interface PageZoom {
  /** Zoom percentages, ascending. */
  levels: readonly number[];
  level: () => number;
  setLevel: (level: number) => void;
}

/**
 * Zoom out and zoom in, in the site header of every studio.code.org page that
 * debug builds of the app load.
 */
export default function SiteControls({zoom}: {zoom: PageZoom}) {
  const [level, setLevel] = useState(zoom.level);
  const index = zoom.levels.indexOf(level);

  // From the page's level, which another page may have changed since.
  function changeZoom(step: number) {
    const next = zoom.levels[zoom.levels.indexOf(zoom.level()) + step];
    if (next !== undefined) {
      zoom.setLevel(next);
      setLevel(next);
    }
  }

  return (
    <div className={styles.controls}>
      <ZoomButton
        label={`Zoom out (${level}%)`}
        iconName="magnifying-glass-minus"
        disabled={index <= 0}
        onClick={() => changeZoom(-1)}
      />
      <ZoomButton
        label={`Zoom in (${level}%)`}
        iconName="magnifying-glass-plus"
        disabled={index === -1 || index >= zoom.levels.length - 1}
        onClick={() => changeZoom(1)}
      />
    </div>
  );
}

interface ZoomButtonProps {
  label: string;
  iconName: string;
  disabled: boolean;
  onClick: () => void;
}

function ZoomButton({label, iconName, disabled, onClick}: ZoomButtonProps) {
  return (
    <Tooltip title={label}>
      {/* A disabled button fires no events, so the tooltip listens here. */}
      <span>
        <IconButton
          className={styles.button}
          aria-label={label}
          variant="outlined"
          color="white"
          size="small"
          disabled={disabled}
          onClick={onClick}
        >
          <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
