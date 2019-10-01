import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3ExperienceAndCommitments from './Section3ExperienceAndCommitments';
import Section4LeadingStudents from './Section4LeadingStudents';
import Section5YourApproachToLearningAndLeading from './Section5YourApproachToLearningAndLeading';
import Section6Submission from './Section6Submission';

export default class Facilitator1920Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static submitButtonText = 'Complete and Send';

  static sessionStorageKey = 'Facilitator1920Application';

  /**
   * @override
   */
  getPageComponents() {
    return [
      Section1AboutYou,
      Section2ChooseYourProgram,
      Section3ExperienceAndCommitments,
      Section4LeadingStudents,
      Section5YourApproachToLearningAndLeading,
      Section6Submission
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
