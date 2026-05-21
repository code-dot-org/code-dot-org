import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import i18n from '@cdo/locale';

import moduleStyles from './passwordReset.module.scss';

// This min length is configured in user.rb with validates_length_of :password
const MIN_PASSWORD_LENGTH = 6;

class PasswordReset extends Component {
  static propTypes = {
    initialIsResetting: PropTypes.bool,
    sectionId: PropTypes.number,
    studentId: PropTypes.number,
    resetDisabled: PropTypes.bool,
    isDemoStudent: PropTypes.bool,
    setPasswordLengthFailure: PropTypes.func,
  };

  state = {
    isResetting: !!this.props.initialIsResetting,
    input: '',
  };

  reset = () => {
    this.setState({
      isResetting: true,
    });
  };

  cancel = () => {
    this.setState({
      isResetting: false,
      input: '',
    });
    this.hidePasswordLengthFailure();
  };

  hidePasswordLengthFailure = () => {
    this.props.setPasswordLengthFailure(false);
  };

  save = () => {
    const {sectionId, studentId} = this.props;

    if (this.state.input.length < MIN_PASSWORD_LENGTH) {
      this.props.setPasswordLengthFailure(true);
      return;
    }

    const dataToUpdate = {
      student: {
        password: this.state.input,
      },
    };

    fetch(`/dashboardapi/sections/${sectionId}/students/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(dataToUpdate),
      credentials: 'same-origin',
    })
      .then(res => {
        if (res.ok) {
          this.setState({
            isResetting: false,
            input: '',
          });
          this.hidePasswordLengthFailure();
        } else {
          const err = new Error('HTTP status code: ' + res.status);
          err.response = res;
          err.status = res.status;
          throw err;
        }
      })
      .catch(() => {
        // We may want to handle this more cleanly in the future, but for now this
        // matches the experience we got in angular
        alert(i18n.unexpectedError());
      });
  };

  updateInput = event => {
    this.setState({
      input: event.target.value,
    });
  };

  render() {
    const {resetDisabled, isDemoStudent} = this.props;
    const tooltipId = resetDisabled && _.uniqueId();
    const tooltipText = isDemoStudent
      ? 'Password actions are not available for demo section students.'
      : i18n.resetTeacherPasswordTooltip();

    return (
      <div className={moduleStyles.passwordResetContainer}>
        {!this.state.isResetting && (
          <span data-for={tooltipId} data-tip>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.reset}
              disabled={resetDisabled}
              type="button"
            >
              {i18n.resetPassword()}
            </MuiButton>
            {resetDisabled && (
              <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
                <div>{tooltipText}</div>
              </ReactTooltip>
            )}
          </span>
        )}
        {this.state.isResetting && (
          <div className={moduleStyles.resetRow}>
            <div className={moduleStyles.inputWrapper}>
              <TextField
                name="newPassword"
                inputType="password"
                size="s"
                placeholder={i18n.newPassword()}
                value={this.state.input}
                onChange={this.updateInput}
                aria-label={i18n.newPassword()}
              />
            </div>
            <div className={moduleStyles.buttonsWrapper}>
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.save}
                type="button"
              >
                {i18n.save()}
              </MuiButton>
              <MuiButton
                variant="outlined"
                color="tertiary"
                size="small"
                onClick={this.cancel}
                type="button"
              >
                {i18n.cancel()}
              </MuiButton>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PasswordReset;
