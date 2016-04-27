var msg = require('../locale');

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var commonStyles = require('../commonStyles');

var styles = {
  instructionsInTopPane: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that when we have don't have
    // instructions below game buttons
    marginBottom: -18
  }
};

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
var GameButtons = function (props) {
  var runButtonClasses = "launch blocklyLaunch";
  if (props.hideRunButton) {
    runButtonClasses += " invisible";
  }

  return (
    <ProtectedStatefulDiv
        id="gameButtons"
        style={props.instructionsInTopPane ? styles.instructionsInTopPane : undefined}>
      <button id="runButton" className={runButtonClasses}>
        <div>{msg.runProgram()}</div>
        <img src="/blockly/media/1x1.gif" className="run26"/>
      </button>
      <button id="resetButton" className="launch blocklyLaunch" style={commonStyles.hidden}>
        <div>{msg.resetProgram()}</div>
        <img src="/blockly/media/1x1.gif" className="reset26"/>
      </button>
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
