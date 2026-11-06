// One ring per group, filling with the share of its checkpoints the
// student is past, with the group's icon in the middle, in its color. Each
// ring is a button that does nothing but take focus, so a keyboard reaches
// its tooltip and a screen reader reads its label.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {GroupProgress} from './map/groupProgress';

import styles from './progressRings.module.scss';

interface ProgressRingsProps {
  rings: GroupProgress[];
}

const ProgressRings: React.FunctionComponent<ProgressRingsProps> = ({
  rings,
}) => (
  <ul className={styles.rings}>
    {rings.map(({key, title, icon, color, done, total}) => {
      const share = total ? done / total : 0;
      const label = `${title}: ${done} of ${total} checkpoints complete`;
      return (
        <li key={key}>
          <Tooltip title={title} arrow>
            <button
              type="button"
              className={classNames(
                styles.ring,
                color && styles[color],
                done === 0 && styles.untouched,
                total > 0 && done === total && styles.complete
              )}
              style={{'--share': share} as React.CSSProperties}
              aria-label={label}
            >
              <span className={styles.inner}>
                {icon && <FontAwesomeV6Icon iconName={icon} />}
              </span>
            </button>
          </Tooltip>
        </li>
      );
    })}
  </ul>
);

export default ProgressRings;
