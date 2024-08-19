import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import PendingButton from '../../legacySharedComponents/PendingButton';
import {storageBackend} from '../storage';

import {castValue} from './dataUtils';
import {refreshCurrentDataView} from './loadDataForView';

import dataStyles from './data-styles.module.scss';

const INITIAL_STATE = {
  isAdding: false,
  // An object whose keys are column names and values are the raw user input.
  newInput: {},
};

class AddTableRow extends React.Component {
  static propTypes = {
    columnNames: PropTypes.array.isRequired,
    tableName: PropTypes.string.isRequired,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  handleChange(columnName, event) {
    const newInput = Object.assign({}, this.state.newInput, {
      [columnName]: event.target.value,
    });
    this.setState({newInput});
  }

  handleAdd = () => {
    try {
      this.props.hideError();
      const record = _.mapValues(this.state.newInput, inputString =>
        castValue(inputString, /* allowUnquotedStrings */ false)
      );
      this.setState({isAdding: true});
      storageBackend().createRecord(
        this.props.tableName,
        record,
        () => {
          refreshCurrentDataView();
          this.setState(INITIAL_STATE);
        },
        msg => console.warn(msg)
      );
    } catch (e) {
      this.setState({isSaving: false});
      this.props.showError();
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
      <tr className={dataStyles.row} id="addDataTableRow">
        {this.props.columnNames.map(columnName => (
          <td key={columnName} className={dataStyles.cell}>
            {columnName === 'id' ? (
              <span style={{color: 'darkgray'}}>#</span>
            ) : (
              <input
                className={dataStyles.input}
                value={this.state.newInput[columnName] || ''}
                placeholder={msg.enterText()}
                onChange={event => this.handleChange(columnName, event)}
                onKeyUp={this.handleKeyUp}
              />
            )}
          </td>
        ))}

        <td className={dataStyles.cell} />

        <td className={classNames(dataStyles.cell, dataStyles.addButton)}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText={msg.addingToTable()}
            className={classNames(dataStyles.button, dataStyles.buttonBlue)}
            text={msg.addRowToTable()}
          />
        </td>
      </tr>
    );
  }
}

export default AddTableRow;
