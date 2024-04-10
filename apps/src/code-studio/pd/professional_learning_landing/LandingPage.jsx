// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import CoteacherInviteNotification from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';
import style from './landingPage.module.scss';
import Tabs from '@cdo/apps/componentLibrary/tabs';

const getAvailableTabs = permissions => {
  let tabs = [
    {
      value: 'myPL',
      text: i18n.plLandingHeading(),
    },
  ];

  if (permissions.includes('facilitator')) {
    tabs.push({
      value: 'myFacilitatorCenter',
      text: i18n.plLandingTabFacilitatorCenter(),
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
  // {
  //   value: 'myInstructorCenter',
  //   text: i18n.plLandingTabInstructorCenter(),
  // },

  return tabs;
};

export default function LandingPage({
  lastWorkshopSurveyUrl,
  lastWorkshopSurveyCourse,
  deeperLearningCourseData,
  currentYearApplicationId,
  workshopsAsParticipant,
  plCoursesInstructed,
  plCoursesStarted,
  userPermissions,
}) {
  const availableTabs = getAvailableTabs(userPermissions);
  const [currentTab, setCurrentTab] = useState(availableTabs[0].value);
  const headerContainerStyles =
    availableTabs.length > 1 ? '' : style.headerWithoutTabsContainer;

  const showGettingStartedBanner =
    !currentYearApplicationId &&
    workshopsAsParticipant?.length === 0 &&
    plCoursesStarted?.length === 0;

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
            <EnrolledWorkshops />
            {deeperLearningCourseData?.length >= 1 && (
              <div>
                <Heading2>Online Professional Learning Courses</Heading2>
                <ProfessionalLearningCourseProgress
                  deeperLearningCourseData={deeperLearningCourseData}
                />
              </div>
            )}
            <section>
              <Heading2>{i18n.plLandingRecommendedHeading()}</Heading2>
              {RenderStaticRecommendedPL()}
            </section>
          </>
        )}
        {currentTab === 'myFacilitatorCenter' && (
          <ContentContainer heading={i18n.plSectionsInstructorTitle()}>
            <CoteacherInviteNotification isForPl={true} />
            <OwnedSections
              isPlSections={true}
              sectionIds={plCoursesInstructed}
              hiddenSectionIds={[]}
            />
          </ContentContainer>
        )}
      </main>
    </>
  );
}

LandingPage.propTypes = {
  lastWorkshopSurveyUrl: PropTypes.string,
  lastWorkshopSurveyCourse: PropTypes.string,
  deeperLearningCourseData: PropTypes.array,
  currentYearApplicationId: PropTypes.number,
  workshopsAsParticipant: PropTypes.array,
  plCoursesInstructed: PropTypes.array,
  plCoursesStarted: PropTypes.array,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
};
