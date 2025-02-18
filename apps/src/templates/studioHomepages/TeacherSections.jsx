import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {AgeGatedSectionsBanner} from '@cdo/apps/templates/policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsBanner';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';
import OwnedSections from '../teacherDashboard/OwnedSections';
import RosterDialog from '../teacherDashboard/RosterDialog';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
} from '../teacherDashboard/teacherSectionsRedux';
import {
  atRiskAgeGatedSections,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsReduxSelectors';

import CoteacherInviteNotification from './CoteacherInviteNotification';
import SetUpSections from './SetUpSections';

function TeacherSections({
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  coteacherInvite,
  ageGatedSections,
  studentSectionIds,
  hiddenStudentSectionIds,
  sectionsAreLoaded,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  useEffect(() => {
    asyncLoadSectionData();
    asyncLoadCoteacherInvite();
  }, [asyncLoadSectionData, asyncLoadCoteacherInvite]);

  const shouldRenderSections = () => {
    return studentSectionIds?.length > 0 || !!coteacherInvite;
  };

  const shouldDisplayAtRiskAgeGatedWarning = () => {
    return ageGatedSections?.length > 0;
  };

  return (
    <div id="classroom-sections">
      <ContentContainer heading={i18n.createSection()}>
        <SetUpSections />
        {!sectionsAreLoaded && <Spinner size="large" style={styles.spinner} />}
      </ContentContainer>
      {shouldRenderSections() && (
        <ContentContainer heading={i18n.sectionsTitle()}>
          <CoteacherInviteNotification isForPl={false} />
          {shouldDisplayAtRiskAgeGatedWarning() && (
            <AgeGatedSectionsBanner
              toggleModal={toggleModal}
              modalOpen={modalOpen}
              ageGatedSections={ageGatedSections}
            />
          )}
          <OwnedSections
            sectionIds={studentSectionIds}
            hiddenSectionIds={hiddenStudentSectionIds}
          />
        </ContentContainer>
      )}
      <RosterDialog />
      <AddSectionDialog />
    </div>
  );
}

TeacherSections.propTypes = {
  asyncLoadSectionData: PropTypes.func.isRequired,
  asyncLoadCoteacherInvite: PropTypes.func.isRequired,
  coteacherInvite: PropTypes.object,
  coteacherInviteForPl: PropTypes.object,
  ageGatedSections: PropTypes.array,
  studentSectionIds: PropTypes.array,
  plSectionIds: PropTypes.array,
  hiddenStudentSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  sectionsAreLoaded: PropTypes.bool,
};

export const UnconnectedTeacherSections = TeacherSections;

export default connect(
  state => ({
    coteacherInvite: state.teacherSections.coteacherInvite,
    ageGatedSections: atRiskAgeGatedSections(state),
    studentSectionIds: state.teacherSections.studentSectionIds,
    hiddenStudentSectionIds: hiddenStudentSectionIds(state),
    sectionsAreLoaded: state.teacherSections.sectionsAreLoaded,
  }),
  {
    asyncLoadCoteacherInvite,
    asyncLoadSectionData,
  }
)(TeacherSections);

const styles = {
  spinner: {
    marginTop: '10px',
  },
};
