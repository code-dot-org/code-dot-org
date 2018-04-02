import {PropTypes} from 'react';
import FormController from '../form_components/FormController';

import Joining from './Joining';
import TravelPlans from './TravelPlans';
import CoursePlans from './CoursePlans';
import Releases from './Releases';

import { TeacherSeatAcceptanceOptions } from '@cdo/apps/generated/pd/teachercon1819RegistrationConstants';

export default class Teachercon1819Registration extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    applicationId: PropTypes.number,
    regionalPartnerId: PropTypes.number,
    applicationType: PropTypes.string.isRequired,
    course: PropTypes.string,
    city: PropTypes.string,
    date: PropTypes.string,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phone: PropTypes.string,
  };

  constructor(props) {
    super(props);

    // initialize some fields with reasonable defaults
    this.state.data = {
      ...this.state.data,
      email: this.props.email,
      preferredFirstName: this.props.firstName,
      lastName: this.props.lastName,
      phone: this.props.phone,
      course: this.props.course,
      applicationType: this.props.applicationType,
      city: this.props.city,
      date: this.props.date
    };
  }

  static sessionStorageKey = "Teachercon1819Registration";

  /**
   * @override
   */
  getPageComponents() {
    if (
        this.state.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions['decline'] ||
        this.state.data.ableToAttend === 'No'
    ) {
      return [Joining];
    } else {
      const pageComponents = [
        Joining,
        TravelPlans,
      ];

      if (this.props.applicationType === "Teacher") {
        pageComponents.push(CoursePlans);
      }

      pageComponents.push(Releases);

      return pageComponents;
    }
  }

  /**
   * @override
   */
  getRequiredFields() {
    const requiredFields = super.getRequiredFields();

    if (this.props.applicationType === "Teacher") {
      requiredFields.push("teacherAcceptSeat");
    } else {
      requiredFields.push("ableToAttend");
    }

    return requiredFields;
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      applicationType: this.props.applicationType,
      course: this.props.course,
      city: this.props.city,
      date: this.props.date,
      email: this.props.email,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      phone: this.props.phone,
    };
  }

  /**
   * @override
   */
  serializeFormData() {
    return {
      ...super.serializeFormData(),
      applicationId: this.props.applicationId,
      regionalPartnerId: this.props.regionalPartnerId,
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
        this.state.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions.decline ||
        this.state.data.ableToAttend === "No";
  }
}
