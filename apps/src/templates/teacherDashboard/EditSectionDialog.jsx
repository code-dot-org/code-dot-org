import React, {Component, PropTypes} from 'react';
import $ from 'jquery';
import BaseDialog from '../BaseDialog';
import EditSectionForm from "./EditSectionForm";

import i18n from '@cdo/locale';

const initialState = {
  loginType: undefined,
  name: '',
  grade: '',
  extras: 'yes',
  pairing: 'yes',
};

export default class EditSectionDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  state = {
    ...initialState,
  };

  handleClose = () => {
    this.props.handleClose();
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
  }

  onClickEditSave = () => {
    //const {updateSection} = this.props;
    //const persistedSection = false;

    const selectedAssignment = this.assignment.getSelectedAssignment();
    const data = {
      //id: null,
      name: this.state.name,
      login_type: this.state.loginType,
      grade: this.state.grade,
      stage_extras: this.state.extras === 'yes' ? true : false,
      pairing_allowed: this.state.pairing === 'yes' ? true : false,
      course_id: selectedAssignment ? selectedAssignment.courseId : null,
    };

    if (selectedAssignment && selectedAssignment.scriptId) {
      data.script = {
        id: selectedAssignment.scriptId
      };
    }

    const suffix = '';
    //const sectionId = -1; // When it's a new section

    $.ajax({
      url: `/v2/sections${suffix}`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
    }).done(result => {
     // updateSection(sectionId, result);
      // close modal after save
      this.handleClose();
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  updateStates(data){
    if (data !== {} || data !== undefined) {
      this.setState({loginType: data.loginType});
      this.setState({name: data.name});
      this.setState({grade: data.grade});
      this.setState({extras: data.stageExtras});
      this.setState({pairing: data.pairingAllowed});
      this.setState({course: data.course_id});
      this.setState({choseLoginType: false});
    }
  }

  renderContent() {
    return (
      <EditSectionForm
        assignmentRef = {(element) => this.assignment = element}
        handleSave={this.onClickEditSave}
        handleClose={this.handleClose}
        name={this.state.name}
        handleName={this.handleNameChange}
        grade={this.state.grade}
        handleGrade={this.handleGradeChange}
        extras={this.state.extras ? 'yes' : 'no'}
        handleExtras={this.handleExtrasChange}
        pairing={this.state.pairing ? 'yes' : 'no'}
        handlePairing={this.handlePairingChange}
      />
    );
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

