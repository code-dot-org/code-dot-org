import {PropTypes} from 'react';
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
  getRequiredFields() {
    const extras = [];

    if (this.props.facilitatorNames.length) {
      extras.push('whoFacilitated');
    }

    return super.getRequiredFields().concat(extras);
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
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  pdEnrollmentCode: PropTypes.string.isRequired,
  facilitatorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};
