import React, {PropTypes} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import Button from "../../templates/Button";

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    color: color.charcoal,
  },
  input: {
    marginBottom: 4,
  },
};

/**
 * Pops up a dialog that prompts the user to confirm their email address.
 * This is used when oauth accounts switch from student to teacher, in order
 * to verify that the email address is already known to the user (it will
 * become visible on the accounts page after the transition, which is a
 * potential violation of student privacy).
 */
export default class ChangeEmailModal extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  cancel = () => {
    this.props.handleCancel();
  };

  save = () => {
    this.props.handleSubmit(this.state.email);
  };

  render = () => {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.cancel}
      >
        <div style={styles.container}>
          <SystemDialogHeader text={i18n.changeEmailModal_title()}/>
          <div>
            <Field>
              <label
                htmlFor="user_email"
                style={styles.label}
              >
                {i18n.changeEmailModal_newEmail_label()}
              </label>
              <input
                id="user_email"
                type="email"
                autoComplete="off"
                maxLength="255"
                size="255"
                style={styles.input}
              />
              <FieldError>
                {i18n.changeEmailModal_newEmail_invalid()}
              </FieldError>
            </Field>
            <Field>
              <label
                htmlFor="user_current_password"
                style={styles.label}
              >
                {i18n.changeEmailModal_currentPassword_label()}
              </label>
              <input
                id="user_current_password"
                type="password"
                maxLength="255"
                size="255"
                style={styles.input}
              />
              <FieldError>
                {i18n.changeEmailModal_currentPassword_isRequired()}
              </FieldError>
            </Field>
            <Field>
              <p>
                {i18n.changeEmailModal_emailOptIn_description()}
              </p>
              <select
                style={{
                  ...styles.input,
                  width: 100,
                }}
              >
                <option selected value=""/>
                <option value="yes">
                  {i18n.yes()}
                </option>
                <option value="no">
                  {i18n.no()}
                </option>
              </select>
              <FieldError>
                {i18n.changeEmailModal_emailOptIn_isRequired()}
              </FieldError>
            </Field>
          </div>
          <SystemDialogConfirmCancelFooter
            confirmText={i18n.changeEmailModal_save()}
            onConfirm={this.save}
            onCancel={this.cancel}
          />
        </div>
      </BaseDialog>
    );
  };
}

const Field = ({children}) => (
  <div
    style={{
      marginBottom: 15,
    }}
  >
    {children}
  </div>
);
Field.propTypes = {children: PropTypes.any};

const FieldError = ({children}) => (
  <div
    style={{
      color: color.red,
      fontStyle: 'italic',
    }}
  >
    {children}
  </div>
);
FieldError.propTypes = {children: PropTypes.string};

const horizontalRuleStyle = {
  borderStyle: 'solid',
  borderColor: color.lighter_gray,
  borderTopWidth: 0,
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
};

class SystemDialogHeader extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  };

  static style = {
    fontSize: 16,
    lineHeight: '20px',
    color: color.charcoal,
    fontFamily: "'Gotham 5r', sans-serif",
    ...horizontalRuleStyle,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 10,
  };

  render() {
    return (
      <h1 style={SystemDialogHeader.style}>
        {this.props.text}
      </h1>
    );
  }
}

class SystemDialogConfirmCancelFooter extends React.Component {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: PropTypes.string.isRequired,
    cancelText: PropTypes.string.isRequired,
  };

  static defaultProps = {
    confirmText: i18n.dialogOK(),
    cancelText: i18n.cancel(),
  };

  static style = {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    ...horizontalRuleStyle,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  };

  render() {
    return (
      <div style={SystemDialogConfirmCancelFooter.style}>
        <Button
          onClick={this.props.onConfirm}
          text={this.props.confirmText}
          color={Button.ButtonColor.orange}
        />
        <Button
          onClick={this.props.onCancel}
          text={this.props.cancelText}
          color={Button.ButtonColor.gray}
        />
      </div>
    );
  }
}
