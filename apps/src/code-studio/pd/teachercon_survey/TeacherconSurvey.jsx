import React from 'react';
import FormController from '../form_components/FormController';

import FridayOnly from './FridayOnly';
import WholeWeek from './WholeWeek';

export default class TeacherconSurvey extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    return [
      FridayOnly,
      WholeWeek
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      facilitatorNames: this.props.facilitatorNames,
      course: this.props.course,
      subject: this.props.subject,
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

TeacherconSurvey.propTypes = {
  ...FormController.propTypes,
  course: React.PropTypes.string.isRequired,
  subject: React.PropTypes.string,
  pdEnrollmentCode: React.PropTypes.string.isRequired,
  facilitatorNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};
