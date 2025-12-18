/** @overview Component for editing a key/value pair row. */
import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import {storageBackend} from '../storage';

import {castValue, displayableValue, editableValue} from './dataUtils';
import {refreshCurrentDataView} from './loadDataForView';

import dataStyles from './data-styles.module.scss';

const INITIAL_STATE = {
  isDeleting: false,
  isEditing: false,
  isSaving: false,
  newValue: '',
};

class EditKeyRow extends React.Component {
  static propTypes = {
    keyName: PropTypes.string.isRequired,
    value: PropTypes.any,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  handleChange = event => this.setState({newValue: event.target.value});

  handleEdit = () =>
    this.setState({
      isEditing: true,
      newValue: editableValue(this.props.value),
    });

  handleSave = () => {
    this.props.hideError();
    try {
      this.setState({isSaving: true});
      const newValue = castValue(
        this.state.newValue,
        /* allowUnquotedStrings */ false
      );
      storageBackend().setKeyValue(
        this.props.keyName,
        newValue,
        this.onKeyValueChanged,
        msg => console.warn(msg)
      );
    } catch (e) {
      this.setState({isSaving: false});
      this.props.showError();
    }
  };

  onKeyValueChanged = () => {
    // Deleting a key/value pair could cause this component to become unmounted.
    if (this.isMounted_) {
      this.setState(INITIAL_STATE);
    }

    refreshCurrentDataView();
  };

  handleDelete = () => {
    this.setState({isDeleting: true});
    storageBackend().deleteKeyValue(
      this.props.keyName,
      this.onKeyValueChanged,
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
      <tr className={classNames(dataStyles.row, 'uitest-kv-table-row')}>
        <td className={dataStyles.cell}>
          {JSON.stringify(this.props.keyName)}
        </td>
        <td className={dataStyles.cell}>
          {this.state.isEditing ? (
            <input
              className={dataStyles.input}
              value={this.state.newValue || ''}
              onChange={this.handleChange}
              onKeyUp={this.handleKeyUp}
            />
          ) : (
            displayableValue(this.props.value)
          )}
        </td>
        <td className={classNames(dataStyles.cell, dataStyles.editButton)}>
          {!this.state.isDeleting &&
            (this.state.isEditing ? (
              <Button
                text={msg.save()}
                onClick={this.handleSave}
                disabled={this.state.isSaving}
                isPending={this.state.isSaving}
                ariaLabel={msg.save()}
                className={classNames(
                  dataStyles.button,
                  dataStyles.buttonText,
                  dataStyles.buttonRightMargin
                )}
                size="s"
                type="secondary"
                color="gray"
              />
            ) : (
              <Button
                text={msg.edit()}
                onClick={this.handleEdit}
                disabled={this.state.isSaving}
                ariaLabel={msg.edit()}
                className={classNames(
                  dataStyles.button,
                  dataStyles.buttonText,
                  dataStyles.buttonRightMargin
                )}
                size="s"
                type="secondary"
                color="gray"
              />
            ))}

          {!this.state.isSaving && (
            <Button
              text={msg.delete()}
              onClick={this.handleDelete}
              disabled={this.state.isDeleting}
              isPending={this.state.isDeleting}
              ariaLabel={msg.delete()}
              className={classNames(dataStyles.button, dataStyles.buttonText)}
              size="s"
              type="primary"
              color="destructive"
            />
          )}
        </td>
      </tr>
    );
  }
}

export default EditKeyRow;
