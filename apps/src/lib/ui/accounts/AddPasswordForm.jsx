import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {Heading3} from '../Headings';
import {Field} from '../SystemDialog/SystemDialog';
import Button from "@cdo/apps/templates/Button";

const styles = {
  container: {
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    // TODO: (before merging) get correct color
    color: color.purple,
  },
  input: {
    marginBottom: 4,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  statusText: {
    paddingLeft: 10,
    fontStyle: 'italic',
  },
};

const SAVING_STATE = i18n.saving();
const SUCCESS_STATE = i18n.success();

const DEFAULT_STATE = {
  password: '',
  passwordConfirmation: '',
  submissionState: ''
};

export default class AddPasswordForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired
  };

  state = DEFAULT_STATE;

  onPasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  };

  onPasswordConfirmationChange = (event) => {
    this.setState({
      passwordConfirmation: event.target.value
    });
  };

  passwordFieldsHaveContent = () => {
    const {password, passwordConfirmation} = this.state;
    return password.length > 0 && passwordConfirmation.length > 0;
  };

  isFormValid = () => {
    const {password, passwordConfirmation} = this.state;
    return this.passwordFieldsHaveContent() && (password === passwordConfirmation);
  };

  getValidationError = () => {
    if (this.passwordFieldsHaveContent() && !this.isFormValid()) {
      return i18n.passwordsMustMatch();
    }
  };

  handleSubmit = () => {
    const {password, passwordConfirmation} = this.state;
    this.setState({
      submissionState: SAVING_STATE
    });
    this.props.handleSubmit(password, passwordConfirmation)
      .then(this.onSuccess, this.onFailure);
  };

  onSuccess = () => {
    this.setState({
      ...DEFAULT_STATE,
      submissionState: SUCCESS_STATE
    });
  };

  onFailure = (error) => {
    this.setState({
      submissionState: error
    });
  };

  render() {
    return (
      <div style={styles.container}>
        <Heading3 style={styles.header}>{i18n.addPassword()}</Heading3>
        <Field
          label={i18n.password()}
        >
          <input
            type="password"
            value={this.state.password}
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onPasswordChange}
            maxLength="255"
            size="255"
            style={styles.input}
          />
        </Field>
        <Field
          label={i18n.passwordConfirmation()}
          error={this.getValidationError()}
        >
          <input
            type="password"
            value={this.state.passwordConfirmation}
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onPasswordConfirmationChange}
            maxLength="255"
            size="255"
            style={styles.input}
          />
        </Field>
        <div style={styles.buttonContainer}>
          {/* TODO: style button to look like other account page buttons */}
          <Button
            id="create-password-btn"
            onClick={this.handleSubmit}
            text={i18n.createPassword()}
            disabled={!this.isFormValid()}
            tabIndex="1"
          />
          {/* TODO: style error state with red text */}
          <div style={styles.statusText}>
            {this.state.submissionState}
          </div>
        </div>
      </div>
    );
  }
}
