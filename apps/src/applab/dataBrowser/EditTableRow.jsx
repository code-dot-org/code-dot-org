import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue, displayValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const EditTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired,
    tableName: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      isEditing: false
    };
  },

  handleChange(columnName, event) {
    const newRecord = Object.assign({}, this.state.newRecord, {
      [columnName]: castValue(event.target.value)
    });
    this.setState({ newRecord });
  },

  handleSave() {
    FirebaseStorage.updateRecord(
      this.props.tableName,
      this.state.newRecord,
      () => this.setState({ isEditing: false }),
      this.handleError
    );
  },

  handleEdit() {
    this.setState({
      isEditing: true,
      newRecord: this.props.record
    });
  },

  handleError(msg) {
    console.warn(msg);
  },

  handleDelete() {
    FirebaseStorage.deleteRecord(
      this.props.tableName,
      this.props.record,
      () => {},
      this.handleError
    );
  },

  render() {
    return (
      <tr style={dataStyles.editRow}>
        {
          this.props.columnNames.map(columnName => (
            <td key={columnName} style={dataStyles.cell}>
              {
                (this.state.isEditing && columnName !== 'id') ?
                  <input
                    style={dataStyles.input}
                    value={displayValue(this.state.newRecord[columnName])}
                    onChange={event => this.handleChange(columnName, event)}
                  /> :
                  JSON.stringify(this.props.record[columnName])
              }
            </td>
          ))
        }

        <td style={dataStyles.buttonCell}>
          {
            this.state.isEditing ?
            <button
                className="btn btn-primary"
                style={dataStyles.editButton}
                onClick={this.handleSave}
            >
              Save
            </button> :
              <button
                  className="btn"
                  style={dataStyles.editButton}
                  onClick={this.handleEdit}
              >
                Edit
              </button>
          }

          <button
              className="btn btn-danger"
              style={dataStyles.button}
              onClick={this.handleDelete}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
});

export default Radium(EditTableRow);
