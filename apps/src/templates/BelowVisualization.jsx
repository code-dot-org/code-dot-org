var React = require('react');
import { connect } from 'react-redux';
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var InputOutputTable = require('./InputOutputTable');

/**
 * The area below our visualization that is share dby all apps.
 */
const BelowVisualization = React.createClass({
  propTypes: {
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    instructionsInTopPane: React.PropTypes.bool.isRequired
  },

  render() {
    const { inputOutputTable, instructionsInTopPane } = this.props;
    return (
      <ProtectedStatefulDiv id="belowVisualization">
        {!instructionsInTopPane &&
          <div
              id="bubble"
              className="clearfix"
          >
            <table id="prompt-table">
              <tbody>
                <tr>
                  <td id="prompt-icon-cell" style={commonStyles.hidden}>
                    <img id="prompt-icon"/>
                  </td>
                  <td id="prompt-cell">
                    <p id="prompt"/>
                    <p id="prompt2" style={commonStyles.hidden}/>
                  </td>
                </tr>
              </tbody>
            </table>

            {inputOutputTable && <InputOutputTable data={inputOutputTable}/>}

            <div id="ani-gif-preview-wrapper" style={commonStyles.hidden}>
              <div id="ani-gif-preview">
              </div>
            </div>
          </div>
        }
      </ProtectedStatefulDiv>
    );
  }
});

export default connect(state => ({
  instructionsInTopPane: state.pageConstants.instructionsInTopPane
}))(BelowVisualization);
