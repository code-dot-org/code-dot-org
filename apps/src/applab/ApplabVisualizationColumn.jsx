var msg = require('../locale');

var Visualization = require('./Visualization');
var Controls = require('./Controls');


var styles = {
  hidden: {
    display: 'none'
  }
};

var GameButtons = React.createClass({
  propTypes: {
    // TODO - better name?
    imgUrl: React.PropTypes.string.isRequired,
    projectLevel: React.PropTypes.bool.isRequired,
    submittable: React.PropTypes.bool.isRequired,
    submitted: React.PropTypes.bool.isRequired,
  },

  render: function () {
    return (
      <div id="gameButtons">
        <button id="runButton" className="launch blocklyLaunch">
          <div>{msg.runProgram()}</div>
          <img src={this.props.imgUrl} className="run26"/>
        </button>
        <button id="resetButton" className="launch blocklyLaunch" style={styles.hidden}>
          <div>{msg.resetProgram()}</div>
          <img src={this.props.imgUrl} className="reset26"/>
        </button>
        {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <Controls
            imgUrl={this.props.imgUrl}
            projectLevel={this.props.projectLevel}
            submittable={this.props.submittable}
            submitted={this.props.submitted}
        />
      </div>
    );
  }
});

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var VisualizationColumn = React.createClass({
  propTypes: {
    imgUrl: React.PropTypes.string.isRequired,
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
    projectLevel: React.PropTypes.bool.isRequired,
    submittable: React.PropTypes.bool.isRequired,
    submitted: React.PropTypes.bool.isRequired,
  },

  render: function () {
    return (
      <div>
        <div id="visualization">
          <Visualization
            appWidth={this.props.appWidth}
            appHeight={this.props.appHeight}/>
        </div>
        <GameButtons
            imgUrl={this.props.imgUrl}
            projectLevel={this.props.projectLevel}
            submittable={this.props.submittable}
            submitted={this.props.submitted}
        />
        <div id="belowVisualization">
          <div id="bubble" className="clearfix">
            <table id="prompt-table">
              <tbody>
                <tr>
                  <td id="prompt-icon-cell" style={styles.hidden}>
                    <img id="prompt-icon"/>
                  </td>
                  <td id="prompt-cell">
                    <p id="prompt"/>
                    <p id="prompt2" style={styles.hidden}/>
                  </td>
                </tr>
              </tbody>
            </table>
            <div id="ani-gif-preview-wrapper">
              <div id="ani-gif-preview">
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
module.exports = VisualizationColumn;
