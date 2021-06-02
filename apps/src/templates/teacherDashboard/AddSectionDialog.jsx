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
    handleCancel: PropTypes.func.isRequired
  };

  render() {
    const {
      isOpen,
      section,
      beginImportRosterFlow,
      setRosterProvider,
      setLoginType,
      handleCancel
    } = this.props;
    const {loginType} = section || {};
    const title = i18n.newSection();
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
          {loginType && <EditSectionForm title={title} isNewSection={true} />}
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
    handleCancel: () => dispatch(cancelEditingSection())
  })
)(AddSectionDialog);
