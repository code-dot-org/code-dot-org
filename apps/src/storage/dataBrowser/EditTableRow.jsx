import FirebaseStorage from '../firebaseStorage';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import PendingButton from '../../templates/PendingButton';
import {castValue, displayableValue, editableValue} from './dataUtils';
import * as dataStyles from './dataStyles';
import _ from 'lodash';

const INITIAL_STATE = {
  isDeleting: false,
  isEditing: false,
  isSaving: false,
  // An object whose keys are column names and values are the raw user input.
  newInput: {}
};

class EditTableRow extends React.Component {
  static propTypes = {
    columnNames: PropTypes.array.isRequired,
    tableName: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  state = {...INITIAL_STATE};

  // Optimization: skip rendering when nothing has changed.
  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged = !_.isEqual(this.props, nextProps);
    const stateChanged = !_.isEqual(this.state, nextState);
    return propsChanged || stateChanged;
  }

  handleChange(columnName, event) {
    const newInput = Object.assign({}, this.state.newInput, {
      [columnName]: event.target.value
    });
    this.setState({newInput});
  }

  handleSave = () => {
    this.props.hideError();
    try {
      const newRecord = _.mapValues(this.state.newInput, inputString =>
        castValue(inputString, /* allowUnquotedStrings */ false)
      );
      this.setState({isSaving: true});
      FirebaseStorage.updateRecord(
        this.props.tableName,
        newRecord,
        this.resetState,
        msg => console.warn(msg)
      );
    } catch (e) {
      this.setState({isSaving: false});
      this.props.showError();
    }
  };

  resetState = () => {
    // Deleting a row may have caused this component to become unmounted.
    if (this.isMounted_) {
      this.setState(INITIAL_STATE);
    }
  };

  handleEdit = () => {
    this.setState({
      isEditing: true,
      newInput: _.mapValues(this.props.record, editableValue)
    });
  };

  handleDelete = () => {
    this.setState({isDeleting: true});
    FirebaseStorage.deleteRecord(
      this.props.tableName,
      this.props.record,
      this.resetState,
      msg => console.warn(msg)
    );
  };

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.handleSave();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr style={dataStyles.row}>
        {this.props.columnNames.map(columnName => (
          <td key={columnName} style={dataStyles.cell}>
            {this.state.isEditing && columnName !== 'id' ? (
              <input
                style={dataStyles.input}
                value={this.state.newInput[columnName] || ''}
                onChange={event => this.handleChange(columnName, event)}
                onKeyUp={this.handleKeyUp}
              />
            ) : (
              displayableValue(this.props.record[columnName])
            )}
          </td>
        ))}

        {!this.props.readOnly && <td style={dataStyles.cell} />}

        {!this.props.readOnly && (
          <td style={dataStyles.editButtonCell}>
            {!this.state.isDeleting &&
              (this.state.isEditing ? (
                <PendingButton
                  isPending={this.state.isSaving}
                  onClick={this.handleSave}
                  pendingText="Saving..."
                  style={dataStyles.saveButton}
                  text="Save"
                />
              ) : (
                <button
                  type="button"
                  style={dataStyles.editButton}
                  onClick={this.handleEdit}
                >
                  Edit
                </button>
              ))}

            {!this.state.isSaving && (
              <PendingButton
                isPending={this.state.isDeleting}
                onClick={this.handleDelete}
                pendingStyle={{float: 'right'}}
                pendingText="Deleting..."
                style={dataStyles.redButton}
                text="Delete"
              />
            )}
          </td>
        )}
      </tr>
    );
  }
}

export default Radium(EditTableRow);
