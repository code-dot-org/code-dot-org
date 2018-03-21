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
    editedValue: PropTypes.bool,
    //Provided by redux
    editStudent: PropTypes.func,
  };

  changeSharing = (e) => {
    this.props.editStudent(this.props.id, {sharingDisabled: this.props.editedValue});
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
              checked={this.props.editedValue}
              onChange={this.changeSharing}
            />
          </div>
        }
      </div>
      );
  }
}

export const UnconnectedManageStudentsSharingCell = ManageStudentsSharingCell;

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
}))(ManageStudentsSharingCell);
