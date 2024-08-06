import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import PendingButton from '../../legacySharedComponents/PendingButton';
import {storageBackend} from '../storage';

import {castValue, displayableValue, editableValue} from './dataUtils';
import {refreshCurrentDataView} from './loadDataForView';

import dataStyles from './data-styles.module.scss';

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
      storageBackend().updateRecord(
        this.props.tableName,
        newRecord,
        this.onRecordChanged,
        msg => console.warn(msg)
      );
    } catch (e) {
      this.setState({isSaving: false});
      this.props.showError();
    }
  };

  onRecordChanged = () => {
    // Deleting a row may have caused this component to become unmounted.
    if (this.isMounted_) {
      this.setState(INITIAL_STATE);
    }

    refreshCurrentDataView();
  };

  handleEdit = () => {
    this.setState({
      isEditing: true,
      newInput: _.mapValues(this.props.record, editableValue),
    });
  };

  handleDelete = () => {
    this.setState({isDeleting: true});
    storageBackend().deleteRecord(
      this.props.tableName,
      this.props.record,
      this.onRecordChanged,
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
