import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import PendingButton from '../../templates/PendingButton';
import { castValue, displayableValue, editableValue } from './dataUtils';
import * as dataStyles from './dataStyles';
import _ from 'lodash';

const EditTableRow = React.createClass({
  propTypes: {
    columnNames: React.PropTypes.array.isRequired,
    tableName: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      isEditing: false,
      isSaving: false,
      newRecord: {}
    };
  },

  // Optimization: skip rendering when nothing has changed.
  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged = !_.isEqual(this.props, nextProps);
    const stateChanged = !_.isEqual(this.state, nextState);
    return propsChanged || stateChanged;
  },

  handleChange(columnName, event) {
    const newRecord = Object.assign({}, this.state.newRecord, {
      [columnName]: castValue(event.target.value)
    });
    this.setState({ newRecord });
  },

  handleSave() {
    this.setState({isSaving: true});
    FirebaseStorage.updateRecord(
      this.props.tableName,
      this.state.newRecord,
      this.handleSaveComplete,
      msg => console.warn(msg)
    );
  },

  handleSaveComplete() {
    this.setState(this.getInitialState());
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
              <PendingButton
                defaultText="Save"
                isPending={this.state.isSaving}
                onClick={this.handleSave}
                pendingText="Saving..."
                style={dataStyles.saveButton}
              /> :
              <button
                style={dataStyles.editButton}
                onClick={this.handleEdit}
              >
                Edit
              </button>
          }

          {
            !this.state.isSaving && (
              <button
                style={dataStyles.redButton}
                onClick={this.handleDelete}
              >
                Delete
              </button>
            )
          }
        </td>
      </tr>
    );
  }
});

export default Radium(EditTableRow);
