import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
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
  cancelEditingSection,
  assignedCourseOffering,
} from './teacherSectionsRedux';
import ParticipantTypePicker from './ParticipantTypePicker';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {navigateToHref} from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';

// Checks if experiment is enabled and navigates to the new section setup page
// if both params are non-null.
const redirectToNewSectionPage = (participantType, loginType) => {
  if (
    experiments.isEnabled('sectionSetupRefresh') &&
    !!participantType &&
    !!loginType
  ) {
    navigateToHref(
      `/sections/new?participantType=${participantType}&loginType=${loginType}`
    );
  }
};

/**
 * UI for a teacher to add a new class section.  For editing a section see
 * EditSectionDialog.
 */
const AddSectionDialog = ({
  isOpen,
  section,
  beginImportRosterFlow,
  setRosterProvider,
  setLoginType,
  setParticipantType,
  handleCancel,
  availableParticipantTypes,
  assignedCourseOffering,
  asyncLoadComplete,
}) => {
  useEffect(() => {
    if (
      assignedCourseOffering &&
      asyncLoadComplete &&
      !section?.participantType
    ) {
      setParticipantType(assignedCourseOffering.participant_audience);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedCourseOffering, asyncLoadComplete, section?.participantType]);

  const {loginType, participantType} = section || {};
  const title = i18n.newSectionUpdated();

  const onParticipantTypeSelection = participantType => {
    if (participantType !== 'student') {
      redirectToNewSectionPage(participantType, SectionLoginType.email);
    }
    setParticipantType(participantType);
  };

  const onLoginTypeSelection = loginType => {
    // Oauth section types should use the roster dialog, not the section setup page
    if (
      [
        SectionLoginType.picture,
        SectionLoginType.word,
        SectionLoginType.email,
      ].includes(loginType)
    ) {
      redirectToNewSectionPage(participantType, loginType);
    }
    setLoginType(loginType);
  };

  const getDialogContent = () => {
    if (!asyncLoadComplete) {
      return <Spinner size="large" style={{padding: 50}} />;
    }
    /*
    The Participant Type Picker will be skipped if someone only have permissions to create sections for one
    type of participants. See teacherSectionsRedux for more details on how this is set up.
    */
    if (!participantType) {
      return (
        <ParticipantTypePicker
          title={title}
          setParticipantType={onParticipantTypeSelection}
          handleCancel={handleCancel}
          availableParticipantTypes={availableParticipantTypes}
        />
      );
    }
    if (!loginType) {
      return (
        <LoginTypePicker
          title={title}
          handleImportOpen={beginImportRosterFlow}
          setRosterProvider={setRosterProvider}
          setLoginType={onLoginTypeSelection}
          handleCancel={handleCancel}
        />
      );
    }
    return <EditSectionForm title={title} isNewSection={true} />;
  };

  if (
    participantType &&
    loginType &&
    experiments.isEnabled('sectionSetupRefresh')
  ) {
    return null;
  } else {
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={isOpen}
        overflow="hidden"
        uncloseable
      >
        <PadAndCenter>{getDialogContent()}</PadAndCenter>
      </BaseDialog>
    );
  }
};

AddSectionDialog.propTypes = {
  // Provided by Redux
  isOpen: PropTypes.bool.isRequired,
  section: sectionShape,
  beginImportRosterFlow: PropTypes.func.isRequired,
  setRosterProvider: PropTypes.func.isRequired,
  setLoginType: PropTypes.func.isRequired,
  setParticipantType: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  availableParticipantTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  assignedCourseOffering: PropTypes.object,
  asyncLoadComplete: PropTypes.bool,
};

export const UnconnectedAddSectionDialog = AddSectionDialog;

export default connect(
  state => ({
    isOpen: isAddingSection(state.teacherSections),
    section: state.teacherSections.sectionBeingEdited,
    availableParticipantTypes: state.teacherSections.availableParticipantTypes,
    assignedCourseOffering: assignedCourseOffering(state),
    asyncLoadComplete: state.teacherSections.asyncLoadComplete,
  }),
  dispatch => ({
    beginImportRosterFlow: () => dispatch(beginImportRosterFlow()),
    setRosterProvider: provider => dispatch(setRosterProvider(provider)),
    setLoginType: loginType => dispatch(editSectionProperties({loginType})),
    setParticipantType: participantType =>
      dispatch(editSectionProperties({participantType})),
    handleCancel: () => dispatch(cancelEditingSection()),
  })
)(AddSectionDialog);
