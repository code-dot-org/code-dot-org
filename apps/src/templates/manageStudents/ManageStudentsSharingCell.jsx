import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import i18n from '@cdo/locale';

import {editStudent} from './manageStudentsRedux';

import moduleStyles from './manageStudentsSharingCell.module.scss';

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

  changeSharing = e => {
    this.props.editStudent(this.props.id, {
      sharingDisabled: this.props.editedValue,
    });
  };

  renderCheckbox = () => {
    return (
      <Checkbox
        name="sharing"
        ariaLabel={i18n.projectSharingColumnHeader()}
        className={moduleStyles.checkbox}
        checked={!!this.props.editedValue}
        disabled={this.props.disabled}
        onChange={this.changeSharing}
        size="s"
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
              <FontAwesomeV6Icon
                iconName="check"
                className={moduleStyles.checkboxIcon}
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

export const UnconnectedManageStudentsSharingCell = ManageStudentsSharingCell;

export default connect(
  state => ({}),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
  })
)(ManageStudentsSharingCell);
