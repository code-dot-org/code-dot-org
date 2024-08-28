import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {navigateToHref} from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';

import LoginTypePicker from './LoginTypePicker';
import PadAndCenter from './PadAndCenter';
import ParticipantTypePicker from './ParticipantTypePicker';
import {sectionShape} from './shapes';
import {
  isAddingSection,
  beginImportRosterFlow,
  setRosterProvider,
  editSectionProperties,
  cancelEditingSection,
  assignedCourseOffering,
} from './teacherSectionsRedux';

// Navigates to the new section setup page if both params are non-null.
const redirectToNewSectionPage = (participantType, loginType) => {
  if (!!participantType && !!loginType) {
    const createSectionFromMyPl = participantType !== 'student';
    const hrefNav =
      `/sections/new?participantType=${participantType}&loginType=${loginType}` +
      (createSectionFromMyPl ? '&redirectToPage=my-professional-learning' : '');
    navigateToHref(hrefNav);
  }
};

/**
 * UI for a teacher to add a new class section.
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
  };

  if (participantType && loginType) {
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
