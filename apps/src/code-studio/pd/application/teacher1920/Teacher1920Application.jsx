import {PropTypes} from 'react';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';

export default class Teacher1920Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static submitButtonText = "Complete and Send";

  static sessionStorageKey = "Teacher1920Application";

  /**
   * @override
   */
  getPageComponents() {
    return [
      Section1AboutYou
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      accountEmail: this.props.accountEmail
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
