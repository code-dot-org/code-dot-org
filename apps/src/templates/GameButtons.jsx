var msg = require('../locale');

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var commonStyles = require('../commonStyles');
var experiments = require('../experiments');
var classNames = require('classnames');
var Radium = require('radium');

var styles = {
  instructionsInTopPane: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that when we have don't have
    // instructions below game buttons
    marginBottom: -18
  }
};

var RunButton = function (props) {
  return (
    <button
        id="runButton"
        className={classNames(['launch', 'blocklyLaunch', props.hidden && 'invisible'])}
        style={props.style}
    >
      <div>{msg.runProgram()}</div>
      <img src="/blockly/media/1x1.gif" className="run26"/>
    </button>
  );
};
RunButton.propTypes = {
  hidden: React.PropTypes.bool,
  style: React.PropTypes.object
};

var ResetButton = Radium(function (props) {
  return (
    <button
        id="resetButton"
        className="launch blocklyLaunch"
        style={[commonStyles.hidden, props.style]}
    >
      <div>{msg.resetProgram()}</div>
      <img src="/blockly/media/1x1.gif" className="reset26"/>
    </button>
  );
});
ResetButton.propTypes = {
  style: React.PropTypes.object
};

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
var GameButtons = function (props) {
  var phoneFrame = experiments.isEnabled('phoneFrame');

  return (
    <ProtectedStatefulDiv
        id="gameButtons"
        style={props.instructionsInTopPane ? styles.instructionsInTopPane : undefined}>
      {!phoneFrame &&
      <RunButton hidden={props.hideRunButton}/>
      }
      {!phoneFrame &&
      <ResetButton/>
      }
      {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
      {props.children}
    </ProtectedStatefulDiv>
  );
};

GameButtons.propTypes = {
  hideRunButton: React.PropTypes.bool,
  instructionsInTopPane: React.PropTypes.bool
};

module.exports = GameButtons;
GameButtons.RunButton = RunButton;
GameButtons.ResetButton = ResetButton;
