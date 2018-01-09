import {PropTypes} from 'react';
import FormController from '../form_components/FormController';

import Welcome from './Welcome';
import Joining from './Joining';
import TravelPlans from './TravelPlans';

export default class Teachercon1819Registration extends FormController {
  static propTypes = {
    ...FormController.propTypes,
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

    console.log(this.props);

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
    return [
      Welcome,
      Joining,
      TravelPlans
    ];
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
  onSuccessfulSubmit() {
    // Let the server display a confirmation page as appropriate
    window.location.reload(true);
  }
}
