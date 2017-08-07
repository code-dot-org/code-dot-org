import PropTypes from 'prop-types';

import FormController from '../form_components/FormController';
import Disclaimer from './Disclaimer';
import WorkshopQuality from './WorkshopQuality';
import PersonalInvolvement from './PersonalInvolvement';
import WorkshopResults from './WorkshopResults';
import Demographics from './Demographics';

export default class WorkshopSurvey extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    let components = [
      Disclaimer,
      WorkshopQuality,
      PersonalInvolvement,
      WorkshopResults,
    ];

    if (this.props.isFirstSurvey) {
      components.push(Demographics);
    }

    return components;
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
      facilitatorNames: this.props.facilitatorNames,
      pdEnrollmentCode: this.props.pdEnrollmentCode,
      course: this.props.course,
      subject: this.props.subject,
      isLocalSummer: this.isLocalSummer()
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

WorkshopSurvey.propTypes = {
  ...FormController.propTypes,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  isFirstSurvey: PropTypes.bool.isRequired,
  pdEnrollmentCode: PropTypes.string.isRequired,
  facilitatorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};
