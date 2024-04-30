// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {Heading2} from '@cdo/component-library';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import SelfPacedProgressTable from './SelfPacedProgressTable';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import CoteacherInviteNotification from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import SetUpSections from '@cdo/apps/templates/studioHomepages/SetUpSections';
import AddSectionDialog from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import style from './landingPage.module.scss';
import './tableStyles.scss';
import Tabs from '@cdo/component-library';
import {
  asyncLoadSectionData,
  asyncLoadCoteacherInvite,
  hiddenPlSectionIds,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import shapes from '@cdo/apps/templates/studioHomepages/shapes';

const getAvailableTabs = permissions => {
  let tabs = [
    {
      value: 'myPL',
      text: i18n.professionalLearning(),
    },
  ];

  if (permissions.includes('facilitator')) {
    tabs.push({
      value: 'myFacilitatorCenter',
      text: i18n.plLandingTabFacilitatorCenter(),
    });
  }

  if (
    permissions.includes('universal_instructor') ||
    permissions.includes('plc_reviewer')
  ) {
    tabs.push({
      value: 'instructors',
      text: i18n.plLandingTabInstructors(),
    });
  }

  // {
  //   value: 'myRPCenter',
  //   text: i18n.plLandingTabRPCenter(),
  // },
  // {
  //   value: 'myWorkshopOrganizerCenter',
  //   text: i18n.plLandingTabWorkshopOrganizerCenter(),
  // },

  return tabs;
};

function LandingPage({
  lastWorkshopSurveyUrl,
  lastWorkshopSurveyCourse,
  deeperLearningCourseData,
  currentYearApplicationId,
  workshopsAsParticipant,
  plCoursesStarted,
  userPermissions,
  joinedStudentSections,
  joinedPlSections,
  plSectionIds,
  hiddenPlSectionIds,
}) {
  const availableTabs = getAvailableTabs(userPermissions);
  const [currentTab, setCurrentTab] = useState(availableTabs[0].value);
  const headerContainerStyles =
    availableTabs.length > 1
      ? style.headerWithTabsContainer
      : style.headerWithoutTabsContainer;

  const showGettingStartedBanner =
    !currentYearApplicationId &&
    workshopsAsParticipant?.length === 0 &&
    plCoursesStarted?.length === 0;

  // Load PL section info into redux
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(asyncLoadSectionData());
    dispatch(asyncLoadCoteacherInvite());
  }, [dispatch]);

  const RenderGettingStartedBanner = () => (
    <TwoColumnActionBlock
      imageUrl={pegasus(
        '/images/fill-540x300/professional-learning/pl-superhero-girl-crop.png'
      )}
      heading={i18n.plLandingGettingStartedHeading()}
      subHeading={i18n.plLandingGettingStartedSubHeading()}
      description={i18n.plLandingGettingStartedDescription()}
      buttons={[
        {
          url: pegasus('/educate/professional-learning'),
          text: i18n.plLandingGettingStartedButton(),
        },
      ]}
    />
  );

  const RenderLastWorkshopSurveyBanner = () => (
    <TwoColumnActionBlock
      imageUrl={pegasus('/shared/images/fill-540x300/misc/teacher.png')}
      subHeading={i18n.plLandingSubheading()}
      description={i18n.plLandingDescription({
        course: lastWorkshopSurveyCourse,
      })}
      buttons={[
        {
          url: lastWorkshopSurveyUrl,
          text: i18n.plLandingStartSurvey(),
          target: '_blank',
        },
      ]}
    />
  );

  const RenderSelfPacedProgressTable = () => {
    return <SelfPacedProgressTable plCoursesStarted={plCoursesStarted} />;
  };

  const RenderStaticRecommendedPL = () => {
    const actionBlocks = [
      {
        overline: i18n.plLandingStaticPLMidHighOverline(),
        imageUrl: pegasus('/images/pl-page-educator-support.png'),
        heading: i18n.plLandingStaticPLMidHighHeading(),
        description: i18n.plLandingStaticPLMidHighDesc(),
        buttons: [
          {
            color: 'purple',
            url: pegasus('/educate/professional-learning/middle-high'),
            text: i18n.plLandingStaticPLMidHighButton(),
          },
        ],
      },
      {
        overline: i18n.plLandingStaticPLSelfPacedOverline(),
        imageUrl: pegasus('/images/fill-448x280/admins-page-pl.png'),
        heading: i18n.plLandingStaticPLSelfPacedHeading(),
        description: i18n.plLandingStaticPLSelfPacedDesc(),
        buttons: [
          {
            color: 'purple',
            url: pegasus('/educate/professional-development-online'),
            text: i18n.plLandingStaticPLSelfPacedButton(),
          },
        ],
      },
    ];
    return <ActionBlocksWrapper actionBlocks={actionBlocks} />;
  };

  return (
    <>
      <div className={`${headerContainerStyles} ${style.headerContainer}`}>
        <HeaderBannerNoImage headingText={i18n.professionalLearning()}>
          {availableTabs.length > 1 && (
            <nav className={style.myPlTabsContainer}>
              <Tabs
                name="myPLTabs"
                tabs={availableTabs}
                defaultSelectedTabValue={availableTabs[0].value}
                onChange={tab => setCurrentTab(tab)}
              />
            </nav>
          )}
        </HeaderBannerNoImage>
      </div>
      <main className={style.wrapper}>
        {currentTab === 'myPL' && (
          <>
            {showGettingStartedBanner && RenderGettingStartedBanner()}
            {lastWorkshopSurveyUrl && RenderLastWorkshopSurveyBanner()}
            {plCoursesStarted?.length >= 1 && (
              <section id={'self-paced-pl'}>
                <Heading2>{i18n.plLandingSelfPacedProgressHeading()}</Heading2>
                {RenderSelfPacedProgressTable()}
              </section>
            )}
            <JoinSectionArea
              initialJoinedStudentSections={joinedStudentSections}
              initialJoinedPlSections={joinedPlSections}
              isTeacher={true}
              isPlSections={true}
            />
            <section>
              <EnrolledWorkshops />
            </section>
            {deeperLearningCourseData?.length >= 1 && (
              <section>
                <Heading2>Online Professional Learning Courses</Heading2>
                <ProfessionalLearningCourseProgress
                  deeperLearningCourseData={deeperLearningCourseData}
                />
              </section>
            )}
            <section>
              <Heading2>{i18n.plLandingRecommendedHeading()}</Heading2>
              {RenderStaticRecommendedPL()}
            </section>
          </>
        )}
        {['myFacilitatorCenter', 'instructors'].includes(currentTab) && (
          <section>
            <Heading2>{i18n.plSectionsInstructorTitle()}</Heading2>
            <SetUpSections
              headingText={i18n.newSectionCreate()}
              descriptionText={i18n.newSectionMyPlAdd()}
              solidBorder={true}
            />
            <CoteacherInviteNotification isForPl={true} />
            <OwnedSections
              isPlSections={true}
              sectionIds={plSectionIds}
              hiddenSectionIds={hiddenPlSectionIds}
            />
            <AddSectionDialog />
          </section>
        )}
      </main>
    </>
  );
}

export const UnconnectedLandingPage = LandingPage;

export default connect(state => ({
  plSectionIds: state.teacherSections.plSectionIds,
  hiddenPlSectionIds: hiddenPlSectionIds(state),
}))(LandingPage);

LandingPage.propTypes = {
  lastWorkshopSurveyUrl: PropTypes.string,
  lastWorkshopSurveyCourse: PropTypes.string,
  deeperLearningCourseData: PropTypes.array,
  currentYearApplicationId: PropTypes.number,
  workshopsAsParticipant: PropTypes.array,
  plCoursesInstructed: PropTypes.array,
  plCoursesStarted: PropTypes.array,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  joinedStudentSections: shapes.sections,
  joinedPlSections: shapes.sections,
  plSectionIds: PropTypes.arrayOf(PropTypes.number),
  hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number),
};
