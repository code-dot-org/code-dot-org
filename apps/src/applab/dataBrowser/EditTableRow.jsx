import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { castValue, displayableValue, editableValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const EditTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired,
    tableName: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      isEditing: false,
      newRecord: {}
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
      msg => console.warn(msg)
    );
  },

  handleEdit() {
    this.setState({
      isEditing: true,
      newRecord: this.props.record
    });
  },

  handleDelete() {
    FirebaseStorage.deleteRecord(
      this.props.tableName,
      this.props.record,
      () => {},
      msg => console.warn(msg)
    );
  },

  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleSave();
    } else if (event.key === 'Escape') {
      this.setState(this.getInitialState());
    }
  },

  render() {
    return (
      <tr style={dataStyles.row}>
        {
          this.props.columnNames.map(columnName => (
            <td key={columnName} style={dataStyles.cell}>
              {
                (this.state.isEditing && columnName !== 'id') ?
                  <input
                    style={dataStyles.input}
                    value={editableValue(this.state.newRecord[columnName])}
                    onChange={event => this.handleChange(columnName, event)}
                    onKeyUp={this.handleKeyUp}
                  /> :
                  displayableValue(this.props.record[columnName])
              }
            </td>
          ))
        }

        <td style={dataStyles.cell}/>

        <td style={dataStyles.editButtonCell}>
          {
            this.state.isEditing ?
            <button
              style={dataStyles.saveButton}
              onClick={this.handleSave}
            >
              Save
            </button> :
            <button
              style={dataStyles.editButton}
              onClick={this.handleEdit}
            >
              Edit
            </button>
          }

          <button
            style={dataStyles.redButton}
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
