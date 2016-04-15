var msg = require('../locale');
var commonStyles = require('../commonStyles');

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');

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
        <div id="visualization">
          {this.props.visualization}
        </div>
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

        { /* TODO- share with app lab? */ }
        <div id="belowVisualization">
          <div id="bubble" className="clearfix">
            <table id="prompt-table">
              <tbody>
                <tr>
                  <td id="prompt-icon-cell" style={commonStyles.hidden}>
                    <img id="prompt-icon"/>
                  </td>
                  <td id="prompt-cell">
                    <p id="prompt"/>
                    <p id="prompt2" style={commonStyles.hidden}>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TODO - other apps have data.inputOutputTable here */}

            <div id="ani-gif-preview-wrapper" style={commonStyles.hidden}>
              <div id="ani-gif-preview">
              </div>
            </div>
          </div>
        </div>
      </span>
    );
  }
});

module.exports = VisualizationColumn;
