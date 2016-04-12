var Visualization = require('./Visualization');
var GameButtons = require('./GameButtons');

var styles = {
  hidden: {
    display: 'none'
  }
};

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
var VisualizationColumn = React.createClass({
  propTypes: {
    // TODO - beter name for this everywhere?
    imgUrl: React.PropTypes.string.isRequired,
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
    isProjectLevel: React.PropTypes.bool.isRequired,
    isSubmittable: React.PropTypes.bool.isRequired,
    isSubmitted: React.PropTypes.bool.isRequired,
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
            isProjectLevel={this.props.isProjectLevel}
            isSubmittable={this.props.isSubmittable}
            isSubmitted={this.props.isSubmitted}
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
