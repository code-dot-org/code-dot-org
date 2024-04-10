// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import style from './landingPage.module.scss';
import Tabs from '@cdo/apps/componentLibrary/tabs';

const getAvailableTabs = () => {
  // [TODO]: return a subset of the tabs below based on the user's permission level
  return [
    {
      value: 'myPL',
      text: i18n.plLandingHeading(),
    },
    // {
    //   value: 'myFacilitatorCenter',
    //   text: i18n.plLandingTabFacilitatorCenter(),
    // },
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
  ];
};

export default function LandingPage({
  lastWorkshopSurveyUrl,
  lastWorkshopSurveyCourse,
  deeperLearningCourseData,
  currentYearApplicationId,
  workshopsAsParticipant,
  plCoursesStarted,
}) {
  const availableTabs = getAvailableTabs();
  const headerContainerStyles =
    availableTabs.length > 1 ? '' : style.headerWithoutTabsContainer;
  // [TODO]: Uncomment this out once currentTab will affect what content is showed.
  // const [currentTab, setCurrentTab] = useState(availableTabs[0].value);

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
                onChange={tab => {
                  // [TODO]: Uncomment this out once
                  // currentTab affects what content
                  // is shown.
                  //setCurrentTab(tab);
                  console.log(tab);
                }}
              />
            </nav>
          )}
        </HeaderBannerNoImage>
      </div>
      <main className={style.wrapper}>
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
  plCoursesStarted: PropTypes.array,
};
