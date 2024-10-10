import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/firehose';
import i18n from '@cdo/locale';

// This min length is configured in user.rb with validates_length_of :password
const MIN_PASSWORD_LENGTH = 6;

class PasswordReset extends Component {
  static propTypes = {
    initialIsResetting: PropTypes.bool,
    sectionId: PropTypes.number,
    studentId: PropTypes.number,
    resetDisabled: PropTypes.bool,
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
          this.recordResetSecret();
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

  recordResetSecret = () => {
    const {sectionId, studentId} = this.props;
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students',
        event: 'reset-secret',
        data_json: JSON.stringify({
          sectionId: sectionId,
          studentId: studentId,
          loginType: 'email',
        }),
      },
      {includeUserId: true}
    );
  };

  updateInput = event => {
    this.setState({
      input: event.target.value,
    });
  };

  render() {
    const {resetDisabled} = this.props;
    const tooltipId = resetDisabled && _.uniqueId();

    return (
      <div>
        {!this.state.isResetting && (
          <span data-for={tooltipId} data-tip>
            <Button
              onClick={this.reset}
              color={Button.ButtonColor.white}
              text={i18n.resetPassword()}
              disabled={resetDisabled}
            />
            {resetDisabled && (
              <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
                <div>{i18n.resetTeacherPasswordTooltip()}</div>
              </ReactTooltip>
            )}
          </span>
        )}
        {this.state.isResetting && (
          <div>
            <input
              style={styles.input}
              placeholder={i18n.newPassword()}
              value={this.state.input}
              onChange={this.updateInput}
            />
            <Button
              onClick={this.save}
              color={Button.ButtonColor.blue}
              text={i18n.save()}
              style={styles.button}
            />
            <Button
              onClick={this.cancel}
              color={Button.ButtonColor.white}
              text={i18n.cancel()}
              style={styles.button}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  input: {
    width: '90%',
    height: 29,
    marginRight: 10,
    marginLeft: 5,
    padding: 5,
  },
  button: {
    margin: 5,
  },
};

export default PasswordReset;
