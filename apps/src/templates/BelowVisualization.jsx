var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var InputOutputTable = require('./InputOutputTable');

/**
 * The area below our visualization that is share dby all apps.
 */
var BelowVisualization = function (props) {
  return (
    <ProtectedStatefulDiv id="belowVisualization">
      <div
          id="bubble"
          className="clearfix"
          style={props.instructionsInTopPane ? commonStyles.hidden : undefined}>
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

        {props.inputOutputTable && <InputOutputTable data={props.inputOutputTable}/>}

        <div id="ani-gif-preview-wrapper" style={commonStyles.hidden}>
          <div id="ani-gif-preview">
          </div>
        </div>
      </div>
    </ProtectedStatefulDiv>
  );
};

BelowVisualization.propTypes = {
  inputOutputTable: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  ),
  instructionsInTopPane: React.PropTypes.bool
};


module.exports = BelowVisualization;
