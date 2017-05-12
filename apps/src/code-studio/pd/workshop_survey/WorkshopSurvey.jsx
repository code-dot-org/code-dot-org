import React from 'react';

import FormComponent from '../form_components/FormComponent';
import {FormGroup} from 'react-bootstrap';

import FormController from '../form_components/FormController';
import WorkshopQuality from './WorkshopQuality';
import PersonalInvolvement from './PersonalInvolvement';
import WorkshopResults from './WorkshopResults';
import Demographics from './Demographics';

class InvalidWorkshop extends FormComponent {
  render() {
    const pegasusSurveyLink = `https://code.org/pd-workshop-survey/${this.props.pdEnrollmentCode}`;

    return (
      <FormGroup>
        <h3>Uh-oh!</h3>
        <p>
          You appear to have followed an invalid survey link. We apologize for
          the confusion; you can try following <a href={pegasusSurveyLink}>this survey link</a> instead.
        </p>
        <p>
          If you believe you've received this message in error, please feel free
          to <a href="mailto:support@code.org">contact us</a> for more
          information.
        </p>
      </FormGroup>
    );
  }
}

InvalidWorkshop.associatedFields = [];

export default class WorkshopSurvey extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    if (this.isLocalSummer()) {
      return [
        WorkshopQuality,
        PersonalInvolvement,
        WorkshopResults,
        Demographics,
      ];
    } else {
      return [
        InvalidWorkshop,
      ];
    }
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
  subject: React.PropTypes.string.isRequired,
  pdEnrollmentCode: React.PropTypes.string.isRequired,
  facilitatorNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};
