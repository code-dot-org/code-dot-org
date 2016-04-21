var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');

var BelowVisualization = function (props) {
  return (
    <ProtectedStatefulDiv id="belowVisualization">
      <div id="bubble" className="clearfix">
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

        {/* TODO - other apps have data.inputOutputTable here */}

        <div id="ani-gif-preview-wrapper" style={commonStyles.hidden}>
          <div id="ani-gif-preview">
          </div>
        </div>
      </div>
    </ProtectedStatefulDiv>
  );
};

module.exports = BelowVisualization;
