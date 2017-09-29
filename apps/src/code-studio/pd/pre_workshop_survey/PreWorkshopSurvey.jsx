import {PropTypes} from 'react';

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
  pdEnrollmentCode: PropTypes.string.isRequired,
  workshopDate: PropTypes.string.isRequired,
  unitsAndLessons: PropTypes.array.isRequired
};
