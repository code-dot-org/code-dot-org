import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import BaseDialog from '../BaseDialog';
import EditSectionForm from "./EditSectionForm";
import {
  isEditingSection,
  finishEditingSection,
  updateSection,
} from './teacherSectionsRedux';
import {newSectionShape} from './shapes';
import i18n from '@cdo/locale';

export class EditSectionDialog extends Component {
  static propTypes = {
    //From Redux
    isOpen: PropTypes.bool.isRequired,
    section: newSectionShape,
    finishEditingSection: PropTypes.func.isRequired,
    updateSection: PropTypes.func.isRequired,
  };

  onClickEditSave = () => {
    const {section, finishEditingSection, updateSection} = this.props;

    //Assumes section are already created.
    const selectedAssignment = this.assignment.getSelectedAssignment();

    const data = {
      id: section.id,
      name: section.name,
      login_type: section.loginType,
      grade: section.grade,
      stage_extras: section.stageExtras,
      pairing_allowed: section.pairingAllowed,
      course_id: selectedAssignment ? selectedAssignment.courseId : null,
    };

    if (selectedAssignment && selectedAssignment.scriptId) {
      data.script = {
        id: selectedAssignment.scriptId
      };
    }

    const suffix =`/${section.id}/update`;

    $.ajax({
      url: `/v2/sections${suffix}`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(data),
    }).done(result => {
      updateSection(section.id, result);
      finishEditingSection();
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  renderContent() {
    return (
      <EditSectionForm
        title={i18n.editSectionDetails()}
        assignmentRef = {(element) => this.assignment = element}
        handleSave={this.onClickEditSave}
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

export default connect(state => ({
  isOpen: isEditingSection(state.teacherSections),
  section: state.teacherSections.sectionBeingEdited,
}), {
  finishEditingSection,
  updateSection,
}, null, { withRef: true })(EditSectionDialog);

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

