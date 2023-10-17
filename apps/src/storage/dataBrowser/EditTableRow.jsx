import FirebaseStorage from '../firebaseStorage';
import PropTypes from 'prop-types';
import React from 'react';
import PendingButton from '../../templates/PendingButton';
import {castValue, displayableValue, editableValue} from './dataUtils';
import dataStyles from './data-styles.module.scss';
import classNames from 'classnames';
import _ from 'lodash';
import msg from '@cdo/locale';

const INITIAL_STATE = {
  isDeleting: false,
  isEditing: false,
  isSaving: false,
  // An object whose keys are column names and values are the raw user input.
  newInput: {},
};

class EditTableRow extends React.Component {
  static propTypes = {
    columnNames: PropTypes.array.isRequired,
    tableName: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired,
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
      [columnName]: event.target.value,
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
      newInput: _.mapValues(this.props.record, editableValue),
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
      <tr className={classNames(dataStyles.row, 'uitest-data-table-row')}>
        {this.props.columnNames.map(columnName => (
          <td key={columnName} className={dataStyles.cell}>
            {this.state.isEditing && columnName !== 'id' ? (
              <input
                className={dataStyles.input}
                value={this.state.newInput[columnName] || ''}
                onChange={event => this.handleChange(columnName, event)}
                onKeyUp={this.handleKeyUp}
              />
            ) : (
              displayableValue(this.props.record[columnName])
            )}
          </td>
        ))}

        {!this.props.readOnly && <td className={dataStyles.cell} />}

        {!this.props.readOnly && (
          <td className={classNames(dataStyles.cell, dataStyles.editButton)}>
            {!this.state.isDeleting &&
              (this.state.isEditing ? (
                <PendingButton
                  isPending={this.state.isSaving}
                  onClick={this.handleSave}
                  pendingText={msg.saving()}
                  className={classNames(
                    dataStyles.button,
                    dataStyles.buttonBlue,
                    dataStyles.buttonBlueSave
                  )}
                  text={msg.save()}
                />
              ) : (
                <button
                  type="button"
                  className={classNames(
                    dataStyles.button,
                    dataStyles.buttonWhite,
                    dataStyles.buttonWhiteEdit
                  )}
                  onClick={this.handleEdit}
                >
                  {msg.edit()}
                </button>
              ))}

            {!this.state.isSaving && (
              <PendingButton
                isPending={this.state.isDeleting}
                onClick={this.handleDelete}
                pendingStyle={{float: 'right'}}
                pendingText={msg.deletingWithEllipsis()}
                className={classNames(dataStyles.button, dataStyles.buttonRed)}
                text={msg.delete()}
              />
            )}
          </td>
        )}
      </tr>
    );
  }
}

export default EditTableRow;
