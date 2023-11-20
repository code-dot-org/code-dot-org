import React from 'react';
import i18n from '@cdo/locale';
import BorderedCallToAction from './BorderedCallToAction';
import PropTypes from 'prop-types';

const ViewFeedback = ({isProfessionalLearningCourse}) => (
  <BorderedCallToAction
    type="feedback"
    headingText={
      isProfessionalLearningCourse
        ? i18n.viewFeedbackInstructor()
        : i18n.viewFeedback()
    }
    descriptionText={
      isProfessionalLearningCourse
        ? i18n.viewFeedbackInstructorDescription()
        : i18n.viewFeedbackDescription()
    }
    buttonText={i18n.viewFeedbackButton()}
    buttonUrl="/feedback"
    solidBorder={true}
  />
);
export default ViewFeedback;

ViewFeedback.propTypes = {
  isProfessionalLearningCourse: PropTypes.bool,
};
