import React, {PropTypes} from 'react';
var msg = require('./locale');

var StepButton = function (props) {
  var classes = 'launch float-right';
  if (!props.showStepButton) {
    classes += ' hide';
  }
  return (
    <button id="stepButton" className={classes}>
      <img src="/blockly/media/1x1.gif"/>
      {msg.step()}
    </button>
  );
};

StepButton.propTypes = {
  showStepButton: PropTypes.bool.isRequired
};

module.exports = StepButton;
