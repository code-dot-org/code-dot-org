import React from 'react';

import FormController from '../form_components/FormController';
import DateConfirm from './DateConfirm';
import TravelInformation from './TravelInformation';
import PhotoRelease from './PhotoRelease';
import LiabilityWaiver from './LiabilityWaiver';
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
  shouldShowSubmit() {
    return super.shouldShowSubmit() ||
        this.state.data.confirmTrainingDate === "No" ||
        this.state.data.confirmTeacherconDate === 'No - I\'m no longer interested';
  }
}

FacilitatorProgramRegistration.propTypes = {
  ...FormController.propTypes,
  options: React.PropTypes.object.isRequired,
  teachercon: React.PropTypes.number.isRequired,
  teacherconLocation: React.PropTypes.string.isRequired,
};
