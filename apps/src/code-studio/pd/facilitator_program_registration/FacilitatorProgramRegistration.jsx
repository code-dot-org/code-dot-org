import {PropTypes} from 'react';

import FormController from '../form_components/FormController';
import DateConfirm from './DateConfirm';
import TravelInformation from './TravelInformation';
import PhotoRelease from '../program_registration/PhotoRelease';
import LiabilityWaiver from '../program_registration/LiabilityWaiver';
import Demographics from './Demographics';

export default class FacilitatorProgramRegistration extends FormController {
  /**
   * @override
   */
  getPageComponents() {
    return [
      DateConfirm,
      TravelInformation,
      PhotoRelease,
      LiabilityWaiver,
      Demographics,
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      course: this.props.course,
      attendanceDates: this.props.attendanceDates,
      teacherconLocation: this.props.teacherconLocation
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
    // Let the server display a confirmation page as appropriate
    window.location.reload(true);
  }

  /**
   * @override
   */
  shouldShowSubmit() {
    return super.shouldShowSubmit() ||
        this.state.data.confirmTrainingDate === "No" ||
        this.state.data.confirmTeacherconDate === 'No - I\'m no longer interested';
  }
}

FacilitatorProgramRegistration.propTypes = {
  ...FormController.propTypes,
  attendanceDates: PropTypes.object.isRequired,
  course: PropTypes.string.isRequired,
  teachercon: PropTypes.number.isRequired,
  teacherconLocation: PropTypes.string.isRequired,
};
