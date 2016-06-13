var React = require('react');

/**
 * A table of inputs and expected outputs that is only used by Calc and Studio.
 */
var InputOutputTable = function (props) {
  return (
    <div>
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

module.exports = InputOutputTable;
