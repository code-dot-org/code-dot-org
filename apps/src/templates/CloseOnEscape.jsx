import PropTypes from 'prop-types';
import React from 'react';

/**
 * Utility wrapper component that calls a close function when the Escape key is pressed
 */
const CloseOnEscape = ({handleClose, className, children}) => {
  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className={className} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

CloseOnEscape.propTypes = {
  handleClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default CloseOnEscape;
