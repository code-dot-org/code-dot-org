/** @file Confirm Dialog for Maker Discount Codes */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import BaseDialog from "./BaseDialog";
import DialogFooter from "./teacherDashboard/DialogFooter";
import Button from "./Button";

const styles = {
  subtitle: {
    fontSize: 16,
  },
  signatureBox: {
    height: 40,
    width: 98 + '%',
  }
};

export default class EligibilityConfirmDialog extends Component {
  static propTypes = {
    handleCancel: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  state = {
    signature: "",
    activeButton: false,
  };

  verifyResponse = () => {
    this.setState({
      activeButton: this.check1.checked
        && this.check2.checked
        && this.check3.checked
        && /\S/.test(this.state.signature)
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
        assetUrl={() => ''}
        style={{padding:20}}
      >
        <h2>{i18n.getCode()}</h2>
        <div style={styles.subtitle} >{i18n.verifyStatementsforCode()}</div>
        <br/>
        <form>
          <label style={styles.boxStyle}>
            <input
              type="checkbox"
              ref={input => this.check1 = input}
              onChange={this.verifyResponse}
            />
            {i18n.verifyStudentCount()}
          </label>
          <label>
            <input
              type="checkbox"
              ref={input => this.check2 = input}
              onChange={this.verifyResponse}
            />
            {i18n.verifyYear()}
          </label>
          <label>
            <input
              type="checkbox"
              ref={input => this.check3 = input}
              onChange={this.verifyResponse}
            />
            {i18n.verifySingleCode()}
          </label>
          <br/>
          <label>
            <div><b>{i18n.verifySignature()}</b> {i18n.typeName()}</div>
            <input
              value=""
              style={styles.signatureBox}
              onChange={this.setSignature}
            />
          </label>
        </form>
        <div>{i18n.contactSupport()}</div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={this.props.handleCancel}
          />
          <Button
            text={i18n.getCode()}
            onClick={this.props.handleSubmit}
            disabled={!this.state.activeButton}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
