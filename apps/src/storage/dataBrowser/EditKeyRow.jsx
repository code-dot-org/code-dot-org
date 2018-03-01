/** @overview Component for editing a key/value pair row. */

import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React, {PropTypes} from 'react';
import PendingButton from '../../templates/PendingButton';
import { castValue, displayableValue, editableValue } from './dataUtils';
import * as dataStyles from './dataStyles';

const INITIAL_STATE = {
  isDeleting: false,
  isEditing: false,
  isSaving: false,
  newValue: ''
};

class EditKeyRow extends React.Component {
  static propTypes = {
    keyName: PropTypes.string.isRequired,
    value: PropTypes.any
  };

  state = {...INITIAL_STATE};

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  handleChange = (event) => this.setState({newValue: event.target.value});

  handleEdit = () => this.setState({
    isEditing: true,
    newValue: editableValue(this.props.value)
  });

  handleSave = () => {
    this.setState({isSaving: true});
    FirebaseStorage.setKeyValue(
      this.props.keyName,
      castValue(this.state.newValue),
      this.resetState,
      msg => console.warn(msg));
  };

  resetState = () => {
    // Deleting a key/value pair could cause this component to become unmounted.
    if (this.isMounted_) {
      this.setState(INITIAL_STATE);
    }
  };

  handleDelete = () => {
    this.setState({isDeleting: true});
    FirebaseStorage.deleteKeyValue(
      this.props.keyName,
      this.resetState,
      msg => console.warn(msg));
  };

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleSave();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  render() {
    return (
      <tr style={dataStyles.row}>
        <td style={dataStyles.cell}>{JSON.stringify(this.props.keyName)}</td>
        <td style={dataStyles.cell}>
          {this.state.isEditing ?
            <input
              style={dataStyles.input}
              value={this.state.newValue || ''}
              onChange={this.handleChange}
              onKeyUp={this.handleKeyUp}
            /> :
            displayableValue(this.props.value)}
        </td>
        <td style={dataStyles.editButtonCell}>
          {
            !this.state.isDeleting && (
              this.state.isEditing ?
                <PendingButton
                  isPending={this.state.isSaving}
                  onClick={this.handleSave}
                  pendingText="Saving..."
                  style={dataStyles.saveButton}
                  text="Save"
                /> :
                <button
                  style={dataStyles.editButton}
                  onClick={this.handleEdit}
                >
                  Edit
                </button>
            )
          }

          {
            !this.state.isSaving && (
              <PendingButton
                isPending={this.state.isDeleting}
                onClick={this.handleDelete}
                pendingStyle={{float: 'right'}}
                pendingText="Deleting..."
                style={dataStyles.redButton}
                text="Delete"
              />
            )
          }
        </td>
      </tr>
    );
  }
}

export default Radium(EditKeyRow);
