/**
 * A component that adds a ribbon to the side of your row to indicate that it is
 * a focus area. Note: This is English only.
 */

import React from 'react';
import ReactTooltip from 'react-tooltip';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

import styles from './focus-area-indicator.module.scss';

const FocusAreaIndicator = () => (
  <div className={styles.main}>
    <div className={styles.arrowContainer}>
      <div className={styles.leftArrow} />
    </div>
    <div className={styles.focusArea}>
      <div className={styles.text}>Focus Area</div>
      <a href={window.location.pathname + '/preview-assignments'}>
        <div className={styles.focusAreaIcon} data-tip data-for="focus-area">
          <FontAwesome icon="pencil" />
        </div>
      </a>
    </div>
    <ReactTooltip id="focus-area" role="tooltip" effect="solid">
      Click to change your focus area.
    </ReactTooltip>
  </div>
);

export default FocusAreaIndicator;
