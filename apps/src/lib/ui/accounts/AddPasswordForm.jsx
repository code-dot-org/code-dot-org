import React from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {Heading3} from '../Headings';
import {Field} from '../SystemDialog/SystemDialog';
import Button from "@cdo/apps/templates/Button";

const styles = {
  container: {
    paddingTop: 20
  },
  header: {
    fontSize: 22,
    // TODO: (before merging) get correct color
    color: color.purple
  },
  input: {
    marginBottom: 4,
  },
};

export default class AddPasswordForm extends React.Component {
  state = {
    password: '',
    passwordConfirmation: ''
  };

  onKeyDown = () => {
    // TODO: submit if enter key
  };

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
            ref={el => this.passwordInput = el}
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
            ref={el => this.passwordConfirmationInput = el}
          />
        </Field>
        {/* TODO: style button to look like other account page buttons */}
        <Button
          onClick={() => {console.log('submitting...');}}
          text={i18n.createPassword()}
          disabled={!this.isFormValid()}
          tabIndex="1"
        />
      </div>
    );
  }
}
