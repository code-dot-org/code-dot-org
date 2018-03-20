import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';
import {Checkbox} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';

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
    const tooltipId = disabled ? "disabled-no-age" : "";

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
            <span data-tip data-for={tooltipId}>
              <Checkbox
                disabled={disabled}
                checked={this.props.editedValue}
                onChange={this.changeSharing}
              />
            </span>
            <ReactTooltip
              id="disabled-no-age"
              class="react-tooltip-hover-stay"
              role="tooltip"
              effect="solid"
              place="top"
              offset={{bottom: 10, right: 50}}
              delayHide={1000}
            >
              <div>
                Please select an age.
              </div>
            </ReactTooltip>
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
