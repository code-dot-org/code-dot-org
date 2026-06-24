import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './change-user-type-section.module.scss';
import commonStyles from './common/common.styles.module.scss';

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_ERROR = 'error';

/**
 * "Account Type" section of the account edit page. Lets the user pick a new
 * account type and confirm. The actual submission (and the student->teacher
 * email-confirmation modal) is owned by ChangeUserTypeController, reached via
 * the onConfirm callback:
 *   - returns a Promise for the direct-submit (teacher->student) path; this
 *     component shows saving/error state around it.
 *   - returns undefined when it opens the modal (student->teacher path).
 */
export default class ChangeUserTypeSection extends React.Component {
  static propTypes = {
    initialUserType: PropTypes.string.isRequired,
    userTypeOptions: PropTypes.arrayOf(
      PropTypes.shape({value: PropTypes.string, text: PropTypes.string})
    ).isRequired,
    heading: PropTypes.string.isRequired,
    dropdownLabel: PropTypes.string.isRequired,
    buttonLabel: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  state = {
    selectedType: this.props.initialUserType,
    saveState: STATE_INITIAL,
  };

  onDropdownChange = event => {
    this.setState({selectedType: event.target.value, saveState: STATE_INITIAL});
  };

  onConfirmClick = () => {
    const result = this.props.onConfirm(this.state.selectedType);
    if (result && typeof result.then === 'function') {
      this.setState({saveState: STATE_SAVING});
      result.then(
        () => {},
        () => this.setState({saveState: STATE_ERROR})
      );
    }
  };

  render() {
    const {
      userTypeOptions,
      heading,
      dropdownLabel,
      buttonLabel,
      initialUserType,
    } = this.props;
    const {selectedType, saveState} = this.state;
    const saving = saveState === STATE_SAVING;
    const changed = selectedType !== initialUserType;

    return (
      <div>
        <hr className={commonStyles.sectionDivider} />
        <MuiTypography
          className={commonStyles.sectionHeader}
          component="h2"
          variant="h5"
          gutterBottom
        >
          {heading}
        </MuiTypography>
        <SimpleDropdown
          name="userType"
          labelText={dropdownLabel}
          isLabelVisible
          selectedValue={selectedType}
          onChange={this.onDropdownChange}
          disabled={saving}
          items={userTypeOptions}
          styleAsFormField
        />
        <div className={styles.farSide}>
          {saving && <span className={styles.status}>{i18n.saving()}</span>}
          {saveState === STATE_ERROR && (
            <span className={styles.error}>
              {i18n.changeUserTypeModal_unexpectedError()}
            </span>
          )}
          <MuiButton
            type="button"
            variant="outlined"
            color="secondary"
            size="small"
            disabled={!changed || saving}
            onClick={this.onConfirmClick}
          >
            {buttonLabel}
          </MuiButton>
        </div>
      </div>
    );
  }
}
