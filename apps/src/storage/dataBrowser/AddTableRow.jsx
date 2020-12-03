import FirebaseStorage from '../firebaseStorage';
import PendingButton from '../../templates/PendingButton';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import {castValue} from './dataUtils';
import * as dataStyles from './dataStyles';
import _ from 'lodash';

const INITIAL_STATE = {
  isAdding: false,
  // An object whose keys are column names and values are the raw user input.
  newInput: {}
};

class AddTableRow extends React.Component {
  static propTypes = {
    columnNames: PropTypes.array.isRequired,
    tableName: PropTypes.string.isRequired,
    showError: PropTypes.func.isRequired,
    hideError: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  handleChange(columnName, event) {
    const newInput = Object.assign({}, this.state.newInput, {
      [columnName]: event.target.value
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
      FirebaseStorage.createRecord(
        this.props.tableName,
        record,
        () => this.setState(INITIAL_STATE),
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
      <tr style={dataStyles.row} id="addDataTableRow">
        {this.props.columnNames.map(columnName => (
          <td key={columnName} style={dataStyles.cell}>
            {columnName === 'id' ? (
              <span style={{color: 'darkgray'}}>#</span>
            ) : (
              <input
                style={dataStyles.input}
                value={this.state.newInput[columnName] || ''}
                placeholder="enter text"
                onChange={event => this.handleChange(columnName, event)}
                onKeyUp={this.handleKeyUp}
              />
            )}
          </td>
        ))}

        <td style={dataStyles.cell} />

        <td style={dataStyles.addButtonCell}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText="Adding..."
            style={dataStyles.blueButton}
            text="Add Row"
          />
        </td>
      </tr>
    );
  }
}

export default Radium(AddTableRow);
