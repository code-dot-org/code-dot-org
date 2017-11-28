import {PropTypes} from 'react';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2YourSchool from './Section2YourSchool';
import Section3ChooseYourProgram from './Section3ChooseYourProgram';
import Section4SummerWorkshop from './Section4SummerWorkshop';
import Section5Submission from './Section5Submission';

export default class Teacher1819Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static submitButtonText = "Complete and Send";

  static sessionStorageKey = "Teacher1819Application";

  /**
   * @override
   */
  getPageComponents() {
    return [
      Section1AboutYou,
      Section2YourSchool,
      Section3ChooseYourProgram,
      Section4SummerWorkshop,
      Section5Submission
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
