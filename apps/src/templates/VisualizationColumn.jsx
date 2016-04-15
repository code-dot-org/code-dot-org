var msg = require('../locale');
var commonStyles = require('../commonStyles');

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var BelowVisualization = require('./BelowVisualization');

var VisualizationColumn = React.createClass({
  propTypes: {
    hideRunButton: React.PropTypes.bool.isRequired,
    visualization: React.PropTypes.element.isRequired,
    controls: React.PropTypes.element.isRequired,
    extraControls: React.PropTypes.element,
  },

  render: function () {
    var runButtonClasses = "launch blocklyLaunch";
    if (this.props.hideRunButton) {
      runButtonClasses += " invisible";
    }

    return (
      <span>
        {this.props.visualization}
        {/* TODO : share with applab game buttons */}
        <ProtectedStatefulDiv id="gameButtons">
          <button id="runButton" className={runButtonClasses}>
            <div>{msg.runProgram()}</div>
            <img src="/blockly/media/1x1.gif" className="run26"/>
          </button>
          <button id="resetButton" className="launch blocklyLaunch" style={commonStyles.hidden}>
            <div>{msg.resetProgram()}</div>
            <img src="/blockly/media/1x1.gif" className="reset26"/>
          </button>
          {this.props.controls}
        </ProtectedStatefulDiv>

        {/* TODO - other apps may have data.pinWorkspaceToBottom */}
        {this.props.extraControls}

        <BelowVisualization/>
      </span>
    );
  }
});

module.exports = VisualizationColumn;
