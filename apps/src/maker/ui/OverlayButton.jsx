/** Button for use in Maker connection status overlays */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './overlay-button.module.scss';

const OverlayButton = ({className, primary, text, onClick}) => {
  return (
    <button
      type="button"
      className={classNames(
        styles.overlayButton,
        primary && styles.primary,
        className
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

OverlayButton.propTypes = {
  className: PropTypes.string,
  primary: PropTypes.bool,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default OverlayButton;
