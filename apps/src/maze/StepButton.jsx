var msg = require('./locale');

var StepButton = function (props) {
  var classes = 'launch float-right';
  if (props.showStepButton) {
    classes += ' showStepButton';
  }
  return (
    <button id="stepButton" className={classes}>
      <img src="/blockly/media/1x1.gif"/>
      {msg.step()}
    </button>
  );
};

StepButton.propTypes = {
  showStepButton: React.PropTypes.bool.isRequired
};

module.exports = StepButton;
