// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import ActionBlocksWrapper from '@cdo/apps/templates/studioHomepages/ActionBlocksWrapper';
import style from './landingPage.module.scss';

export default function LandingPage({
  lastWorkshopSurveyUrl,
  lastWorkshopSurveyCourse,
  deeperLearningCourseData,
  currentYearApplicationId,
  workshopsAsParticipant,
  plCoursesStarted,
}) {
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
      <HeaderBannerNoImage
        headingText={i18n.professionalLearning()}
        backgroundColor={color.light_gray_50}
      />
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
        <section style={{marginTop: '3rem'}}>
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
