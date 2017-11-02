/** @file Confirm Dialog for Maker Discount Codes */
import React, {Component} from 'react';
import i18n from "@cdo/locale";
import BaseDialog from "./BaseDialog";
import DialogFooter from "./teacherDashboard/DialogFooter";
import Button from "./Button";

const styles = {
  subtitle: {
    fontSize: 16,
  }
};

export default class EligibilityConfirmDialog extends Component {
  state = {
    signature: "",
    activeButton: false,
  };

  verifyResponse = () => {
    if (document.getElementById('verify1').checked &&
        document.getElementById('verify2').checked &&
        document.getElementById('verify3').checked &&
        this.state.signature !== ""){
      this.setState({activeButton : true});
    } else { // if someone unchecks their responses
      this.setState({activeButton: false});
    }
  }

  setSignature = (value) => {
    this.setState({signature : value});
    this.verifyResponse();
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        uncloseable
        isOpen = {true}
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
              id="verify1"
              onChange={this.verifyResponse}
            />
            {i18n.verifyStudentCount()}
          </label>
          <label>
            <input
              type="checkbox"
              id="verify2"
              onChange={this.verifyResponse}
            />
            {i18n.verifyYear()}
          </label>
          <label>
            <input
              type="checkbox"
              id="verify3"
              onChange={this.verifyResponse}
            />
            {i18n.verifySingleCode()}
          </label>
          <br/>
          <label>
            <div><b>{i18n.verifySignature()}</b>  {i18n.typeName()}</div>
            <input
              value=""
              style={{width: 98 + '%', height: 40}}
              onChange={() => this.setSignature(this.value)}
            />
          </label>
        </form>
        <div>{i18n.contactSupport()}</div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={() => {}}
          />
          <Button
            text={i18n.getCode()}
            onClick={() => {}}
            disabled={!this.state.activeButton}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
