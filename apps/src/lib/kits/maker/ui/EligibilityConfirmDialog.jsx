/** @file Confirm Dialog for Maker Discount Codes */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import BaseDialog from "@cdo/apps/templates/BaseDialog";
import DialogFooter from "@cdo/apps/templates/teacherDashboard/DialogFooter";
import Button from "@cdo/apps/templates/Button";

const styles = {
  subtitle: {
    fontSize: 16,
  },
  form: {
    margin: '10px 0',
  },
  signature: {
    margin: '5px 0'
  },
  signatureBox: {
    height: 40,
    width: '100%',
    boxSizing: 'border-box',
    padding: 10,
  },
  checkboxes: {
    paddingLeft: 5,
    marginBottom: 20
  },
  checkboxLabel: {
    marginLeft: 25,
  },
  checkbox: {
    marginLeft: -25,
    width: 25,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
  bold: {
    fontFamily: '"Gotham 7r", sans-serif',
    display: 'inline',
  }
};

export default class EligibilityConfirmDialog extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
  };

  state = {
    signature: "",
    validInput: false,
    submitting: false,
    error: ''
  };

  verifyResponse = () => {
    this.setState({
      validInput: this.check1.checked
        && this.check2.checked
        && this.check3.checked
        && /\S/.test(this.state.signature)
    });
  }

  handleSubmit = () => {
    this.setState({submitting: true});
    $.ajax({
     url: "/maker/complete",
     type: "post",
     dataType: "json",
     data: {
       signature: this.state.signature
     }
   }).done(data => {
     this.props.onSuccess(data.code, data.expiration);
   }).fail((jqXHR, textStatus) => {
     this.setState({
       error: "We're sorry, but something went wrong. Try refreshing the page " +
        "and submitting again.  If this does not work, please contact support@code.org."
      });
   });
  }

  setSignature = (event) => {
    this.setState({signature: event.target.value}, this.verifyResponse);
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        uncloseable
        isOpen
        style={{padding:20}}
      >
        <h2>{i18n.getCode()}</h2>
        <div style={styles.subtitle} >{i18n.verifyStatementsforCode()}</div>
        <form style={styles.form}>
          <div style={styles.checkboxes}>
            <label style={styles.checkboxLabel}>
              <input
                style={styles.checkbox}
                type="checkbox"
                ref={input => this.check1 = input}
                disabled={this.state.submitting}
                onChange={this.verifyResponse}
              />
              {i18n.verifyStudentCount()}
            </label>
            <label style={styles.checkboxLabel}>
              <input
                style={styles.checkbox}
                type="checkbox"
                ref={input => this.check2 = input}
                disabled={this.state.submitting}
                onChange={this.verifyResponse}
              />
              {i18n.verifyYear()}
            </label>
            <label style={styles.checkboxLabel}>
              <input
                style={styles.checkbox}
                type="checkbox"
                ref={input => this.check3 = input}
                disabled={this.state.submitting}
                onChange={this.verifyResponse}
              />
              {i18n.verifySingleCode()}
            </label>
          </div>
          <label>
            <div>{i18n.verifySignature()}</div>
            <div style={styles.signature}>
              <strong style={styles.bold}>Electronic Signature</strong> {i18n.typeName()}
            </div>
            <input
              value={this.state.signature}
              disabled={this.state.submitting}
              style={styles.signatureBox}
              onChange={this.setSignature}
            />
          </label>
        </form>
        <div>{i18n.contactSupport()}</div>
        {this.state.error &&
          <div style={styles.error}>{this.state.error}</div>
        }
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={this.props.onCancel}
            color={Button.ButtonColor.gray}
          />
          <Button
            text={i18n.getCode()}
            onClick={this.handleSubmit}
            disabled={!this.state.validInput || this.state.submitting}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
