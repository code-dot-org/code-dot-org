// My Professional Learning landing page
// studio.code.org/my-professional-learning

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {UnconnectedTwoColumnActionBlock as TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import HeaderBannerNoImage from '@cdo/apps/templates/HeaderBannerNoImage';
import style from './landingPage.module.scss';

export default class LandingPage extends Component {
  static propTypes = {
    lastWorkshopSurveyUrl: PropTypes.string,
    lastWorkshopSurveyCourse: PropTypes.string,
    deeperLearningCourseData: PropTypes.array,
  };

  render() {
    return (
      <div>
        <HeaderBannerNoImage
          headingText={i18n.professionalLearning()}
          backgroundColor={color.light_gray_50}
        />
        <main className={style.wrapper}>
          {this.props.lastWorkshopSurveyUrl && (
            <LastWorkshopSurveyBanner
              subHeading={i18n.plLandingSubheading()}
              description={i18n.plLandingDescription({
                course: this.props.lastWorkshopSurveyCourse,
              })}
              surveyUrl={this.props.lastWorkshopSurveyUrl}
            />
          )}
          <EnrolledWorkshops />
          {this.props.deeperLearningCourseData && (
            <ProfessionalLearningCourseProgress
              deeperLearningCourseData={this.props.deeperLearningCourseData}
            />
          )}
        </main>
      </div>
    );
  }
}

export const LastWorkshopSurveyBanner = ({
  subHeading,
  description,
  surveyUrl,
}) => (
  <TwoColumnActionBlock
    isRtl={false}
    responsiveSize="lg"
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
