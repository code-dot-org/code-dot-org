import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';
import {Checkbox} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

class ManageStudentsSharingCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
    disabled: PropTypes.bool,
    checked: PropTypes.bool,
    //Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  state = {
    checked: this.props.checked
  };

  toggleSharingCheckbox = () => {
    this.setState({
      checked: !this.state.checked
    }, this.changeSharing);
  };

  changeSharing = (e) => {
    this.props.editStudent(this.props.id, {sharingDisabled: !this.state.checked});
  };

  render() {
    const {disabled, checked} = this.props;
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            {checked &&
              <FontAwesome
                icon="check"
                className="fa-check"
              />
            }
          </div>
        }
        {this.props.isEditing &&
          <div>
            <Checkbox
              disabled={disabled}
              checked={this.state.checked}
              onChange={this.toggleSharingCheckbox}
            />
          </div>
        }
      </div>
      );
  }
}

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
}))(ManageStudentsSharingCell);
