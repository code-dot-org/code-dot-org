/** @overview Component for adding a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import PendingButton from '../../templates/PendingButton';
import Radium from 'radium';
import React, {PropTypes} from 'react';
import { castValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const INITIAL_STATE = {
  isAdding: false,
  key: '',
  value: ''
};

class AddKeyRow extends React.Component {
  static propTypes = {
    onShowWarning: PropTypes.func.isRequired,
  };

  state = {...INITIAL_STATE};

  handleKeyChange = (event) => {
    this.setState({key: event.target.value});
  };

  handleValueChange = (event) => {
    this.setState({value: event.target.value});
  };

  handleAdd = () => {
    if (this.state.key) {
      this.setState({isAdding: true});
      FirebaseStorage.setKeyValue(
        this.state.key,
        castValue(this.state.value),
        () => this.setState(INITIAL_STATE),
        msg => {
          if (msg.includes('The key is invalid') || msg.includes('The key was renamed')) {
            this.props.onShowWarning(msg);
          } else {
            console.warn(msg);
          }
          this.setState(INITIAL_STATE);
        });
    }
  };

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleAdd();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr id="uitest-addKeyValuePairRow" style={dataStyles.row}>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleKeyChange}
            onKeyUp={this.handleKeyUp}
            placeholder="enter text"
            value={this.state.key || ''}
          />
        </td>
        <td style={dataStyles.cell}>
          <input
            style={dataStyles.input}
            onChange={this.handleValueChange}
            onKeyUp={this.handleKeyUp}
            placeholder="enter text"
            value={this.state.value || ''}
          />
        </td>
        <td style={dataStyles.addButtonCell}>
          <PendingButton
            isPending={this.state.isAdding}
            onClick={this.handleAdd}
            pendingText="Adding"
            style={dataStyles.blueButton}
            text="Add pair"
          />
        </td>
      </tr>
    );
  }
}

export default Radium(AddKeyRow);
