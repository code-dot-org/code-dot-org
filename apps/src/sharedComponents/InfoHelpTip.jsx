import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import styles from './info-help-tip.module.scss';

export default function InfoHelpTip({id, content}) {
  return (
    <span className={styles.infoHelpTip}>
      <span data-tip data-for={id}>
        <FontAwesomeV6Icon
          iconName="circle-info"
          className={styles.infoTipIcon}
        />
      </span>
      <ReactTooltip id={id} role="tooltip" effect="solid">
        <div className={styles.infoToolTipBox}>
          <Typography className={styles.infoToolTipText} variant="body3">
            {content}
          </Typography>
        </div>
      </ReactTooltip>
    </span>
  );
}

InfoHelpTip.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};
