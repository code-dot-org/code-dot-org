import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './borderedCallToAction.module.scss';

const BorderedCallToAction = ({
  headingText,
  descriptionText,
  className,
  buttonText,
  buttonUrl,
  buttonClass,
  buttonDisabled = false,
  onClick,
  solidBorder,
}) => {
  if (!buttonUrl && !onClick) {
    throw new Error('Expect at least one of buttonUrl / onClick');
  }

  const borderStyle = solidBorder ? styles.solidBorder : styles.dashedBorder;

  return (
    <div className={`${styles.outerBox} ${borderStyle} ${className}`}>
      <div className={styles.textWrapper}>
        <Typography component="h3" variant="h5" gutterBottom>
          {headingText}
        </Typography>
        <Typography variant="body3" gutterBottom>
          {descriptionText}
        </Typography>
      </div>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        disabled={buttonDisabled}
        className={buttonClass}
        onClick={onClick}
        href={buttonUrl}
      >
        {buttonText}
      </MuiButton>
    </div>
  );
};

BorderedCallToAction.propTypes = {
  headingText: PropTypes.string.isRequired,
  descriptionText: PropTypes.string.isRequired,
  className: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonUrl: PropTypes.string,
  buttonClass: PropTypes.string,
  onClick: PropTypes.func,
  solidBorder: PropTypes.bool,
  buttonDisabled: PropTypes.bool,
};

export default BorderedCallToAction;
