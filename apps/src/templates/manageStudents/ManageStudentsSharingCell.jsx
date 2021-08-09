import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';
import color from '../../util/color';

class ManageStudentsSharingCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
    disabled: PropTypes.bool,
    checked: PropTypes.bool,
    editedValue: PropTypes.bool,
    //Provided by redux
    editStudent: PropTypes.func
  };

  changeSharing = e => {
    this.props.editStudent(this.props.id, {
      sharingDisabled: this.props.editedValue
    });
  };

  renderCheckbox = () => {
    return (
      <input
        type="checkbox"
        disabled={this.props.disabled}
        checked={this.props.editedValue}
        onChange={this.changeSharing}
        style={styles.checkbox}
      />
    );
  };

  render() {
    const {disabled, checked, isEditing} = this.props;
    const showToolTip = disabled;

    return (
      <div>
        {!isEditing && (
          <div>
            {checked && (
              <FontAwesome
                icon="check"
                className="fa-check"
                style={styles.checkboxIcon}
              />
            )}
          </div>
        )}
        {isEditing && (
          <div>
            {showToolTip && (
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
                  offset={{bottom: 5}}
                  delayHide={1000}
                >
                  <div>{i18n.sharingAgePrompt()}</div>
                </ReactTooltip>
              </div>
            )}
            {!showToolTip && <span>{this.renderCheckbox()}</span>}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  checkboxIcon: {
    color: color.lighter_gray
  },
  checkbox: {
    height: 20,
    width: 20
  }
};

export const UnconnectedManageStudentsSharingCell = ManageStudentsSharingCell;

export default connect(
  state => ({}),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    }
  })
)(ManageStudentsSharingCell);
