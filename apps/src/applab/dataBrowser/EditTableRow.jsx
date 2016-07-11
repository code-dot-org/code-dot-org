import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';

const EditTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired,
    record: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        {
          this.props.columnNames.map(columnName => (
            <td key={columnName} style={dataStyles.cell}>
              {JSON.stringify(this.props.record[columnName])}
            </td>
          ))
        }

        <td style={dataStyles.cell}>
          <button
              className="btn"
              style={dataStyles.editButton}
          >
            Edit
          </button>

          <button
              className="btn btn-danger"
              style={dataStyles.button}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(EditTableRow);
