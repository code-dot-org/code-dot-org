import React, {Component, PropTypes} from 'react';
import $ from 'jquery';
import BaseDialog from '../BaseDialog';
import AddInitialStudentsView from './AddInitialStudentsView';
import EditSectionForm from "./EditSectionForm";
import i18n from '@cdo/locale';

export default class AddSectionDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  state = {
    loginType: ''
  };

  handleClose = () => this.props.handleClose();

  handleLoginChoice = (loginType) => {
    this.setState({loginType});
  };

  onClickEditSave = () => {
    //const persistedSection = false;
    const data = {
      //id: null,
      name: "TempTest",
      login_type: this.state.loginType,
      // grade: this.grade.value,
      // stage_extras: this.stageExtras.checked,
      // pairing_allowed: this.pairingAllowed.checked,
      // course_id: assignment ? assignment.courseId : null,
    };

    const suffix = '';

    $.ajax({
      url: `/v2/sections${suffix}`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
    }).done(result => {
      //updateSection(sectionId, result);
      // close modal after save
      this.handleClose();
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  renderContent() {
    if (this.state.loginType === '') {
      return (
        <AddInitialStudentsView
          sectionName="Foobar"
          handleLoginChoice={this.handleLoginChoice}
        />
      );
    } else {
      return (
        <EditSectionForm
          handleSave={this.onClickEditSave}
        />
      );
    }
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        assetUrl={() => ''}
        {...this.props}
      >
      {this.renderContent()}
      </BaseDialog>
    );
  }
}
