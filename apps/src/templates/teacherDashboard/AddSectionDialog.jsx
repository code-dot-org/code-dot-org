import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import LoginTypePicker from './LoginTypePicker';
import EditSectionForm from './EditSectionForm';
import PadAndCenter from './PadAndCenter';
import {sectionShape} from './shapes';
import {
  isAddingSection,
  beginImportRosterFlow,
  setRosterProvider,
  editSectionProperties,
  cancelEditingSection
} from './teacherSectionsRedux';
import AudienceTypePicker from './AudienceTypePicker';

/**
 * UI for a teacher to add a new class section.  For editing a section see
 * EditSectionDialog.
 */
class AddSectionDialog extends Component {
  static propTypes = {
    // Provided by Redux
    isOpen: PropTypes.bool.isRequired,
    section: sectionShape,
    beginImportRosterFlow: PropTypes.func.isRequired,
    setRosterProvider: PropTypes.func.isRequired,
    setLoginType: PropTypes.func.isRequired,
    setParticipantType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired
  };

  render() {
    const {
      isOpen,
      section,
      beginImportRosterFlow,
      setRosterProvider,
      setLoginType,
      setParticipantType,
      handleCancel
    } = this.props;
    const {loginType, audience} = section || {};
    const title = i18n.newSectionUpdated();
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={isOpen}
        overflow="hidden"
        uncloseable
      >
        <PadAndCenter>
          {!loginType && (
            <LoginTypePicker
              title={title}
              handleImportOpen={beginImportRosterFlow}
              setRosterProvider={setRosterProvider}
              setLoginType={setLoginType}
              handleCancel={handleCancel}
            />
          )}
          {loginType && !audience && (
            <AudienceTypePicker
              title={title}
              setParticipantType={setParticipantType}
              handleCancel={handleCancel}
            />
          )}
          {loginType && audience && (
            <EditSectionForm
              title={title}
              isNewSection={true}
              audience={audience}
            />
          )}
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: isAddingSection(state.teacherSections),
    section: state.teacherSections.sectionBeingEdited
  }),
  dispatch => ({
    beginImportRosterFlow: () => dispatch(beginImportRosterFlow()),
    setRosterProvider: provider => dispatch(setRosterProvider(provider)),
    setLoginType: loginType => dispatch(editSectionProperties({loginType})),
    setParticipantType: audience => dispatch(editSectionProperties({audience})),
    handleCancel: () => dispatch(cancelEditingSection())
  })
)(AddSectionDialog);
