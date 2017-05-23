import React from 'react';

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
  course: React.PropTypes.string.isRequired,
  subject: React.PropTypes.string,
  isFirstSurvey: React.PropTypes.bool.isRequired,
  pdEnrollmentCode: React.PropTypes.string.isRequired,
  facilitatorNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};
