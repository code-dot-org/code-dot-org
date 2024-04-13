import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';
import AgeGatedStudentsModal from '../teacherDashboard/AgeGatedStudentsModal';
import OwnedSections from '../teacherDashboard/OwnedSections';
import RosterDialog from '../teacherDashboard/RosterDialog';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsRedux';

import CoteacherInviteNotification from './CoteacherInviteNotification';
import SetUpSections from './SetUpSections';

const TeacherSections = ({
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  coteacherInvite,
  coteacherInviteForPl,
  studentSectionIds,
  plSectionIds,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
  sectionsAreLoaded,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    asyncLoadSectionData();
    asyncLoadCoteacherInvite();
  }, [asyncLoadSectionData, asyncLoadCoteacherInvite]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const renderChildAccountPolicyNotification = () => {
    return (
      <div>
        <Notification
          type={NotificationType.warning}
          notice="Heads up!"
          details="Some of your students are under 13 and will require parental consent to continue using their personal accounts after 7/1/2024. "
          dismissible={false}
          buttonText="Show details"
          buttonLink="#"
          onButtonClick={() => toggleModal()}
        />
        {modalOpen && <AgeGatedStudentsModal onClose={() => toggleModal()} />}
      </div>
    );
  };

  const shouldRenderSections = () => {
    return studentSectionIds?.length > 0 || !!coteacherInvite;
  };

  const shouldRenderPlSections = () => {
    return plSectionIds?.length > 0 || !!coteacherInviteForPl;
  };

  return (
    <div id="classroom-sections">
      <ContentContainer heading={i18n.createSection()}>
        <SetUpSections />
        {!sectionsAreLoaded && <Spinner size="large" style={styles.spinner} />}
      </ContentContainer>
      {shouldRenderSections() && (
        <ContentContainer heading={i18n.sectionsTitle()}>
          {renderChildAccountPolicyNotification()}
          <CoteacherInviteNotification isForPl={false} />
          <OwnedSections
            sectionIds={studentSectionIds}
            hiddenSectionIds={hiddenStudentSectionIds}
          />
        </ContentContainer>
      )}
      {shouldRenderPlSections() && (
        <ContentContainer heading={i18n.plSectionsTitle()}>
          <CoteacherInviteNotification isForPl={true} />
          <OwnedSections
            isPlSections={true}
            sectionIds={plSectionIds}
            hiddenSectionIds={hiddenPlSectionIds}
          />
        </ContentContainer>
      )}
      <RosterDialog />
      <AddSectionDialog />
    </div>
  );
};

TeacherSections.propTypes = {
  //Redux provided
  asyncLoadSectionData: PropTypes.func.isRequired,
  asyncLoadCoteacherInvite: PropTypes.func.isRequired,
  coteacherInvite: PropTypes.object,
  coteacherInviteForPl: PropTypes.object,
  studentSectionIds: PropTypes.array,
  plSectionIds: PropTypes.array,
  hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  hiddenStudentSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  sectionsAreLoaded: PropTypes.bool,
};

const styles = {
  spinner: {
    marginTop: '10px',
  },
};

export const UnconnectedTeacherSections = TeacherSections;
export default connect(
  state => ({
    coteacherInvite: state.teacherSections.coteacherInvite,
    coteacherInviteForPl: state.teacherSections.coteacherInviteForPl,
    studentSectionIds: state.teacherSections.studentSectionIds,
    plSectionIds: state.teacherSections.plSectionIds,
    hiddenPlSectionIds: hiddenPlSectionIds(state),
    hiddenStudentSectionIds: hiddenStudentSectionIds(state),
    sectionsAreLoaded: state.teacherSections.sectionsAreLoaded,
  }),
  {
    asyncLoadCoteacherInvite,
    asyncLoadSectionData,
  }
)(TeacherSections);
