import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import BaseDialog from '../BaseDialog';
import AddInitialStudentsView from './AddInitialStudentsView';
import EditSectionForm from "./EditSectionForm";

import i18n from '@cdo/locale';
import { updateSection } from './teacherSectionsRedux';
const initialState = {
  loginType: undefined,
};

export class AddSectionDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
    // Provided by Redux
    updateSection: PropTypes.func.isRequired,
  };

  state = {
    ...initialState,
  };

  handleClose = () => {
    this.props.handleClose();
    this.setState(initialState);
  };

  handleLoginChoice = (loginType) => {
    this.setState({loginType});
  };

  handleGoBack = () => {
    this.setState({loginType: ''});
  };

  onClickEditSave = () => {
    const {updateSection} = this.props;
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
    const sectionId = -1; // When it's a new section

    $.ajax({
      url: `/v2/sections${suffix}`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
    }).done(result => {
      updateSection(sectionId, result);
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
    if (!this.state.loginType) {
      return (
        <AddInitialStudentsView
          sectionName="Foobar"
          handleLoginChoice={this.handleLoginChoice}
          handleCancel={this.handleClose}
        />
      );
    } else {
      return (
        <EditSectionForm
          handleSave={this.onClickEditSave}
          handleBack={this.handleGoBack}
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
        uncloseable
        assetUrl={() => ''}
      >
        <PadAndCenter>
          {this.renderContent()}
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(() => ({}), { updateSection })(AddSectionDialog);

const PadAndCenter = ({children}) => (
  <div
    style={{
      display: 'flex',
      flexFlow: 'row',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20,
    }}
  >
    {children}
  </div>
);
PadAndCenter.propTypes = {children: PropTypes.any};

