import React, {PropTypes} from 'react';

import FormController from '../form_components/FormController';
import DateConfirm from './DateConfirm';
import TravelInformation from './TravelInformation';
import PhotoRelease from '../program_registration/PhotoRelease';
import LiabilityWaiver from '../program_registration/LiabilityWaiver';

export default class RegionalPartnerProgramRegistration extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    return [
      DateConfirm,
      TravelInformation,
      PhotoRelease,
      LiabilityWaiver,
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      teacherconLocation: this.props.teacherconLocation,
      teacherconDates: this.props.teacherconDates
    };
  }

  /**
   * @override
   */
  serializeFormData() {
    return {
      ...super.serializeFormData(),
      teachercon: this.props.teachercon
    };
  }

  /**
   * @override
   */
  onSuccessfulSubmit() {
    this.setState({
      successfulSubmit: true
    });
  }

  /**
   * @override
   */
  shouldShowSubmit() {
    return super.shouldShowSubmit() ||
        this.state.data.confirmTeacherconDate === "No";
  }

  /**
   * @override
   */
  render() {
    if (this.state.successfulSubmit) {
      return (
        <div>
          <p>
            Thanks for registering.
          </p>
          <p>
            We're excited you're joining TeacherCon 2017! You will receive more
            information about travel approximately six weeks before TeacherCon.
          </p>
          <p>
            In the meantime, please contact &nbsp;
            <a href="mailto:partner@code.org">partner@code.org</a> with any
            questions. We look forward to seeing you this summer!
          </p>
        </div>
      );
    }

    return super.render();
  }
}

RegionalPartnerProgramRegistration.propTypes = {
  ...FormController.propTypes,
  teachercon: PropTypes.number.isRequired,
  teacherconLocation: PropTypes.string.isRequired,
  teacherconDates: PropTypes.string.isRequired,
};
