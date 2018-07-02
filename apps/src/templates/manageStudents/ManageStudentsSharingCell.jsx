import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';
import {Checkbox} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import i18n from "@cdo/locale";
import color from "../../util/color";

const styles = {
  checkmark: {
    color: color.lighter_gray,
  },
};

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

  renderCheckbox = () => {
    return (
      <Checkbox
        disabled={this.props.disabled}
        checked={this.props.editedValue}
        onChange={this.changeSharing}
      />
    );
  };

  render() {
    const {disabled, checked, isEditing} = this.props;
    const showToolTip = disabled;

    return (
      <div>
        {!isEditing &&
          <div>
            {checked &&
              <FontAwesome
                icon="check"
                className="fa-check"
                style={styles.checkmark}
              />
            }
          </div>
        }
        {isEditing &&
          <div>
            {showToolTip &&
              <div>
                <span data-tip="" data-for="disabled-no-age">
                  {this.renderCheckbox()}
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
                    {i18n.sharingAgePrompt()}
                  </div>
                </ReactTooltip>
              </div>
            }
            {!showToolTip &&
              <span>
                {this.renderCheckbox()}
              </span>
            }
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
