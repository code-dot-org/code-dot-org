import PropTypes from 'prop-types';
import React from 'react';
import msg from './locale';

var StepButton = function (props) {
  var classes = 'launch float-right';
  if (!props.showStepButton) {
    classes += ' hide';
  }
  return (
    <button type="button" id="stepButton" className={classes}>
      <img src="/blockly/media/1x1.gif" />
      {msg.step()}
    </button>
  );
};

StepButton.propTypes = {
  showStepButton: PropTypes.bool.isRequired,
};

export default StepButton;
