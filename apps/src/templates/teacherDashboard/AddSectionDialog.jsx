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
  name: '',
  grade: '',
  extras: 'yes',
  pairing: 'yes',
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

  handleNameChange = (name) => {
    this.setState({name});
  };

  handleGradeChange = (grade) => {
    this.setState({grade});
  };

  handleExtrasChange = (extras) => {
    this.setState({extras});
  };

  handlePairingChange = (pairing) => {
    this.setState({pairing});
  };

  onClickEditSave = () => {
    const {updateSection} = this.props;
    const {name, loginType, grade, extras, pairing} = this.state;

    const selectedAssignment = this.assignment.getSelectedAssignment();
    const data = {
      name: name,
      login_type: loginType,
      grade: grade,
      stage_extras: extras === 'yes',
      pairing_allowed: pairing === 'yes',
      course_id: selectedAssignment ? selectedAssignment.courseId : null,
    };

    if (selectedAssignment && selectedAssignment.scriptId) {
      data.script = {
        id: selectedAssignment.scriptId
      };
    }

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
    const {name, grade, loginType, extras, pairing} = this.state;
    const title = i18n.newSection();
    if (!loginType) {
      return (
        <AddInitialStudentsView
          title={title}
          handleLoginChoice={this.handleLoginChoice}
          handleCancel={this.handleClose}
        />
      );
    } else {
      return (
        <EditSectionForm
          title={title}
          assignmentRef = {(element) => this.assignment = element}
          handleSave={this.onClickEditSave}
          handleClose={this.handleClose}
          name={name}
          handleName={this.handleNameChange}
          grade={grade}
          handleGrade={this.handleGradeChange}
          extras={extras}
          handleExtras={this.handleExtrasChange}
          pairing={pairing}
          handlePairing={this.handlePairingChange}
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

export default connect(undefined, { updateSection })(AddSectionDialog);

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

