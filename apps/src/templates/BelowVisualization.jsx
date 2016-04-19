var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');

/**
 * A table of inputs and expected outputs that is only used by Calc.
 */
var InputOutputTable = function (props) {
  return (
    <div id="input-table">
      <table>
        <tbody>
          <tr>
            <th>Input</th>
            <th>Output</th>
          </tr>
          {props.data.map(function (item, index) {
            return (
              <tr key={index}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
InputOutputTable.propTypes = {
  data: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  ).isRequired
};

/**
 * The area below our visualization that is share dby all apps.
 */
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
  )
};


module.exports = BelowVisualization;
