var msg = require('../locale');

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var commonStyles = require('../commonStyles');

var GameButtons = function (props) {
  var runButtonClasses = "launch blocklyLaunch";
  if (props.hideRunButton) {
    runButtonClasses += " invisible";
  }

  return (
    <ProtectedStatefulDiv id="gameButtons">
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
  hideRunButton: React.PropTypes.bool
};

module.exports = GameButtons;
