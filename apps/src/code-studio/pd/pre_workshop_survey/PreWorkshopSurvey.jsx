import React from 'react';

import FormController from '../form_components/FormController';
import PreWorkshopQuestions from './PreWorkshopQuestions';

export default class PreWorkshopSurvey extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    return [
      PreWorkshopQuestions
    ];
  }

  isLocalSummer() {
    return this.props.course === "CS Principles" && this.props.subject === "5-day Summer";
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      workshopDate: this.props.workshopDate,
      unitsAndLessons: this.props.unitsAndLessons
    };
  }

  /**
   * @override
   */
  serializeFormData() {
    return {
      ...super.serializeFormData(),
      pd_enrollment_code: this.props.pdEnrollmentCode,
    };
  }

  /**
   * @override
   */
  onSuccessfulSubmit() {
    // Let the server display a confirmation page as appropriate
    window.location.reload(true);
  }
}

PreWorkshopSurvey.propTypes = {
  ...FormController.propTypes,
  pdEnrollmentCode: React.PropTypes.string.isRequired,
  workshopDate: React.PropTypes.string.isRequired,
  unitsAndLessons: React.PropTypes.array.isRequired
};
