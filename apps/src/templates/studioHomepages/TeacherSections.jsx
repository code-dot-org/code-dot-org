import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import ChildSectionsWarningNotification from '@cdo/apps/templates/childAccountPolicy/ChildSectionsWarningNotification';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';
import OwnedSections from '../teacherDashboard/OwnedSections';
import RosterDialog from '../teacherDashboard/RosterDialog';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  getChildAccountSections,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsRedux';

import CoteacherInviteNotification from './CoteacherInviteNotification';
import SetUpSections from './SetUpSections';

function TeacherSections({
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  childAccountSections,
  coteacherInvite,
  coteacherInviteForPl,
  isUsa,
  studentSectionIds,
  plSectionIds,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
  sectionsAreLoaded,
}) {
  useEffect(() => {
    asyncLoadSectionData();
    asyncLoadCoteacherInvite();
  }, [asyncLoadSectionData, asyncLoadCoteacherInvite]);

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
          {!_.isEmpty(childAccountSections) && isUsa && (
            <ChildSectionsWarningNotification />
          )}
          <CoteacherInviteNotification isForPl={false} />
          <OwnedSections
            sectionIds={studentSectionIds}
            hiddenSectionIds={hiddenStudentSectionIds}
          />
        </ContentContainer>
      )}
      {shouldRenderPlSections() && (
        <ContentContainer heading={i18n.plSectionsTitle()}>
          <BodyTwoText>
            {i18n.myProfessionalLearningSectionsHomepageDesc()}
          </BodyTwoText>
          <LinkButton
            color={'purple'}
            href={studio('/my-professional-learning')}
            iconLeft={{
              iconName: 'book-circle-arrow-right',
              iconStyle: 'solid',
            }}
            size="s"
            text={i18n.myProfessionalLearningSectionsHomepageButton()}
          />
        </ContentContainer>
      )}
      <RosterDialog />
      <AddSectionDialog />
    </div>
  );
}

TeacherSections.propTypes = {
  //Redux provided
  asyncLoadSectionData: PropTypes.func.isRequired,
  asyncLoadCoteacherInvite: PropTypes.func.isRequired,
  childAccountSections: PropTypes.arrayOf(PropTypes.number),
  coteacherInvite: PropTypes.object,
  coteacherInviteForPl: PropTypes.object,
  isUsa: PropTypes.bool,
  studentSectionIds: PropTypes.array,
  plSectionIds: PropTypes.array,
  hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  hiddenStudentSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  sectionsAreLoaded: PropTypes.bool,
};

export const UnconnectedTeacherSections = TeacherSections;

export default connect(
  state => ({
    childAccountSections: getChildAccountSections(
      state,
      state.teacherSections.studentSectionIds
    ),
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

const styles = {
  spinner: {
    marginTop: '10px',
  },
};
