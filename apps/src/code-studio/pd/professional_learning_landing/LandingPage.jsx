// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
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

  return (
    <>
      <HeaderBannerNoImage
        headingText={i18n.professionalLearning()}
        backgroundColor={color.light_gray_50}
      />
      <main className={style.wrapper}>
        {showGettingStartedBanner && <GettingStartedBanner />}
        {lastWorkshopSurveyUrl && (
          <LastWorkshopSurveyBanner
            subHeading={i18n.plLandingSubheading()}
            description={i18n.plLandingDescription({
              course: lastWorkshopSurveyCourse,
            })}
            surveyUrl={lastWorkshopSurveyUrl}
          />
        )}
        <EnrolledWorkshops />
        {deeperLearningCourseData?.length >= 1 && (
          <div>
            <h2>Online Professional Learning Courses</h2>
            <ProfessionalLearningCourseProgress
              deeperLearningCourseData={deeperLearningCourseData}
            />
          </div>
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
  plCoursesStarted: PropTypes.array,
};

export const LastWorkshopSurveyBanner = ({
  subHeading,
  description,
  surveyUrl,
}) => (
  <TwoColumnActionBlock
    imageUrl={pegasus('/shared/images/fill-540x300/misc/teacher.png')}
    subHeading={subHeading}
    description={description}
    buttons={[
      {
        url: surveyUrl,
        text: i18n.plLandingStartSurvey(),
        target: '_blank',
      },
    ]}
  />
);

LastWorkshopSurveyBanner.propTypes = {
  subHeading: PropTypes.string,
  description: PropTypes.string,
  surveyUrl: PropTypes.string,
};

export const GettingStartedBanner = () => (
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
