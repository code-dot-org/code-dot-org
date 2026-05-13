import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import styles from './assigned.module.scss';

export default class Assigned extends Component {
  render() {
    return (
      <span className={`${styles.assigned} uitest-assigned`}>
        <span className={styles.checkmark}>
          <FontAwesomeV6Icon iconName="check" iconStyle="solid" />
        </span>
        <Typography variant="body2" component="span">
          <strong>{i18n.assigned()}</strong>
        </Typography>
      </span>
    );
  }
}
