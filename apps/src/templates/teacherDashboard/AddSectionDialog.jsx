import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import BaseDialog from '../BaseDialog';
import LoginTypePicker from './LoginTypePicker';
import EditSectionForm from "./EditSectionForm";
import PadAndCenter from './PadAndCenter';
import i18n from '@cdo/locale';
import {sectionShape} from './shapes';
import {
  isAddingSection,
  finishEditingSection,
  updateSection,
} from './teacherSectionsRedux';

export class AddSectionDialog extends Component {
  static propTypes = {
    // Provided by Redux
    isOpen: PropTypes.bool.isRequired,
    section: sectionShape,
    finishEditingSection: PropTypes.func.isRequired,
    updateSection: PropTypes.func.isRequired,
  };

  onClickEditSave = () => {
    const {section, updateSection, finishEditingSection} = this.props;

    const data = {
      name: section.name,
      login_type: section.loginType,
      grade: section.grade,
      stage_extras: section.stageExtras,
      pairing_allowed: section.pairingAllowed,
      course_id: section.courseId || null,
    };

    if (section.scriptId) {
      data.script = {
        id: section.scriptId
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
      finishEditingSection();
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  render() {
    const {isOpen, section} = this.props;
    const {loginType} = section || {};
    const title = i18n.newSection();
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={isOpen}
        uncloseable
        assetUrl={() => ''}
      >
        <PadAndCenter>
          {!loginType && /* First page */
            <LoginTypePicker title={title}/>
          }
          {loginType && /* Second page */
            <EditSectionForm
              title={title}
              handleSave={this.onClickEditSave}
            />
          }
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(state => ({
  isOpen: isAddingSection(state.teacherSections),
  section: state.teacherSections.sectionBeingEdited,
}), {
  finishEditingSection,
  updateSection,
})(AddSectionDialog);
