import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import AboutYou from './AboutYou';
import ChooseYourProgram from './ChooseYourProgram';
import ExperienceAndCommitments from './ExperienceAndCommitments';
import LeadingStudents from './LeadingStudents';
import YourApproachToLearningAndLeading from './YourApproachToLearningAndLeading';
import Submission from './Submission';

export default class FacilitatorApplication extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static submitButtonText = 'Complete and Send';

  static sessionStorageKey = 'FacilitatorApplication';

  /**
   * @override
   */
  getPageComponents() {
    return [
      AboutYou,
      ChooseYourProgram,
      ExperienceAndCommitments,
      LeadingStudents,
      YourApproachToLearningAndLeading,
      Submission
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
