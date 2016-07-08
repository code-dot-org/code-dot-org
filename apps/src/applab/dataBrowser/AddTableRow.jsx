import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';

const AddTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired
  },

  render() {
    return (
      <tr style={dataStyles.addRow}>
        {
          this.props.columnNames.map(columnName => (
            <td key={columnName} style={dataStyles.cell}>
              { (columnName !== 'id') && <input style={dataStyles.input}/> }
            </td>
          ))
        }
        <td style={dataStyles.cell}>
          <button
            className="btn btn-primary"
            style={dataStyles.button}
          >
            Add Row
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(AddTableRow);
