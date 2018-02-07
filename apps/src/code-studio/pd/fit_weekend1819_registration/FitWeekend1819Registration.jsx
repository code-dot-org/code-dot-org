import {PropTypes} from 'react';
import FormController from '../form_components/FormController';

import Welcome from './Welcome';
import Joining from './Joining';
import TravelPlans from './TravelPlans';
import Releases from './Releases';
import Confirmation from './Confirmation';

export default class FitWeekend1819Registration extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    applicationId: PropTypes.number.isRequired,
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

  static sessionStorageKey = "FitWeekend1819Registration";

  /**
   * @override
   */
  getPageComponents() {
    return [
      Welcome,
      Joining,
      TravelPlans,
      Releases,
      Confirmation
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
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
        this.state.data.ableToAttend === "No";
  }
}
