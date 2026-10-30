import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './DemoChip.module.scss';

const DemoChip = ({className}) => (
  <span className={classNames(styles.demoChip, className)}>
    <span className={styles.demoChipText}>Demo</span>
  </span>
);

DemoChip.propTypes = {
  className: PropTypes.string,
};

export default DemoChip;
