/** @overview Component for adding a key/value pair row. */
import FirebaseStorage from '../firebaseStorage';
import PendingButton from '../../templates/PendingButton';
import PropTypes from 'prop-types';
import React from 'react';
import {castValue} from './dataUtils';
import dataStyles from './data-styles.module.scss';
import classNames from 'classnames';
import {WarningType} from '../constants';

const INITIAL_STATE = {
  isAdding: false,
  key: '',
  value: ''
};

class AddKeyRow extends React.Component {
  static propTypes = {
    onShowWarning: PropTypes.func.isRequired,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired
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
        FirebaseStorage.setKeyValue(
          this.state.key,
          value,
          () => this.setState(INITIAL_STATE),
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
            placeholder="enter text"
            value={this.state.key || ''}
          />
        </td>
        <td className={dataStyles.cell}>
          <input
            className={dataStyles.input}
            onChange={this.handleValueChange}
            onKeyUp={this.handleKeyUp}
            placeholder="enter text"
            value={this.state.value || ''}
          />
        </td>
        <td className={classNames(dataStyles.cell, dataStyles.addButton)}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText="Adding"
            className={classNames(dataStyles.button, dataStyles.buttonBlue)}
            text="Add pair"
          />
        </td>
      </tr>
    );
  }
}

export default AddKeyRow;
