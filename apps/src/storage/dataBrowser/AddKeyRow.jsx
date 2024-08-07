/** @overview Component for adding a key/value pair row. */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import PendingButton from '../../legacySharedComponents/PendingButton';
import {WarningType} from '../constants';
import {storageBackend} from '../storage';

import {castValue} from './dataUtils';
import {refreshCurrentDataView} from './loadDataForView';

import dataStyles from './data-styles.module.scss';

const INITIAL_STATE = {
  isAdding: false,
  key: '',
  value: '',
};

class AddKeyRow extends React.Component {
  static propTypes = {
    onShowWarning: PropTypes.func.isRequired,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  handleKeyChange = event => {
    this.setState({key: event.target.value});
  };

  handleValueChange = event => {
    this.setState({value: event.target.value});
  };

  handleAdd = () => {
    if (this.state.key) {
      this.props.hideError();
      try {
        this.setState({isAdding: true});
        const value = castValue(
          this.state.value,
          /* allowUnquotedStrings */ false
        );
        storageBackend().setKeyValue(
          this.state.key,
          value,
          () => {
            this.setState(INITIAL_STATE);
            refreshCurrentDataView();
          },
          err => {
            if (
              err.type === WarningType.KEY_INVALID ||
              err.type === WarningType.KEY_RENAMED
            ) {
              this.props.onShowWarning(err.msg);
            } else {
              console.warn(err.msg ? err.msg : err);
            }
            this.setState(INITIAL_STATE);
          }
        );
      } catch (e) {
        this.setState({isAdding: false});
        this.props.showError();
      }
    }
  };

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr id="uitest-addKeyValuePairRow" className={dataStyles.row}>
        <td className={dataStyles.cell}>
          <input
            className={dataStyles.input}
            onChange={this.handleKeyChange}
            onKeyUp={this.handleKeyUp}
            placeholder={msg.enterText()}
            value={this.state.key || ''}
          />
        </td>
        <td className={dataStyles.cell}>
          <input
            className={dataStyles.input}
            onChange={this.handleValueChange}
            onKeyUp={this.handleKeyUp}
            placeholder={msg.enterText()}
            value={this.state.value || ''}
          />
        </td>
        <td className={classNames(dataStyles.cell, dataStyles.addButton)}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText={msg.addingToTable()}
            className={classNames(dataStyles.button, dataStyles.buttonBlue)}
            text={msg.addPairToTable()}
          />
        </td>
      </tr>
    );
  }
}

export default AddKeyRow;
