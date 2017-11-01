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
    checkStudentCount: false,
    checkYear: false,
    checkSingleCode: false,
    signature: "",
    activeButton: false,
  };

  verifyResponse = () => {
    if (this.state.checkStudentCount &&
        this.state.checkYear &&
        this.state.checkSingleCode &&
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
            <input type="checkbox" value="verify1" onChange={() => {this.setState({checkStudentCount : !this.state.checkStudentCount}); this.verifyResponse();}}/>
            {i18n.verifyStudentCount()}
          </label>
          <label>
            <input type="checkbox" value="verify2" onChange={() => {this.setState({checkYear : !this.state.checkYear}); this.verifyResponse();}}/>
            {i18n.verifyYear()}
          </label>
          <label>
            <input type="checkbox" value="verify3" onChange={() => {this.setState({checkSingleCode : !this.state.checkSingleCode}); this.verifyResponse();}}/>
            {i18n.verifySingleCode()}
          </label>
          <br/>
          <label>
            <div><b>{i18n.verifySignature()}</b>  {i18n.typeName()}</div>
            <input value="" style={{width: 98 + '%', height: 40}} onChange={() => this.setSignature(this.value)}></input>
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
            disabled={this.state.activeButton ? false : true}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
