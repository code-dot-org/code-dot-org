var msg = require('../locale');

var CompletionButton = require('./CompletionButton');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var commonStyles = require('../commonStyles');

var GameButtons = function (props) {
  return (
    <ProtectedStatefulDiv id="gameButtons">
      <button id="runButton" className="launch blocklyLaunch">
        <div>{msg.runProgram()}</div>
        <img src="/blockly/media/1x1.gif" className="run26"/>
      </button>
      <button id="resetButton" className="launch blocklyLaunch" style={commonStyles.hidden}>
        <div>{msg.resetProgram()}</div>
        <img src="/blockly/media/1x1.gif" className="reset26"/>
      </button>
      {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
      <CompletionButton/>
    </ProtectedStatefulDiv>
  );
};

module.exports = GameButtons;
