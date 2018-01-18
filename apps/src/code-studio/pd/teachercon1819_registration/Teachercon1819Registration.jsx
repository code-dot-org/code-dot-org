import {PropTypes} from 'react';
import FormController from '../form_components/FormController';

import Welcome from './Welcome';
import Joining from './Joining';
import TravelPlans from './TravelPlans';
import CoursePlans from './CoursePlans';
import Releases from './Releases';
import Confirmation from './Confirmation';

import { TeacherSeatAcceptanceOptions } from '@cdo/apps/generated/pd/teachercon1819RegistrationConstants';

export default class Teachercon1819Registration extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    applicationId: PropTypes.number.isRequired,
    applicationType: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
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
      phone: this.props.phone
    };
  }

  static sessionStorageKey = "Teachercon1819Registration";

  /**
   * @override
   */
  getPageComponents() {
    const pageComponents = [
      Welcome,
      Joining,
      TravelPlans,
    ];

    if (this.props.applicationType === "Teacher") {
      pageComponents.push(CoursePlans);
    }

    // We want to include the confirmation page by default, but remove it if the
    // teacher has responded to the "accept seat" question with something other
    // than yes. It would of course be easier to just add the confirmation page
    // once they respond yes, but if we do that then the user-visible page count
    // will _grow_ as they progress through the form, which is a much weirder
    // user experience than it shrinking.
    if (!(this.state.data.teacherAcceptSeat && this.state.data.teacherAcceptSeat !== TeacherSeatAcceptanceOptions.accept)) {
      pageComponents.push(Confirmation);
    }

    pageComponents.push(Releases);

    return pageComponents;
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
      applicationId: this.props.applicationId
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
        this.state.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions.decline;
  }
}
