import {PropTypes} from 'react';

import FormController from '../../form_components/FormController';
import Section1QuestionsAboutYou from './Section1QuestionsAboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3LeadingStudents from './Section3LeadingStudents';
import Section4FacilitationExperience from './Section4FacilitationExperience';
import Section5YourApproachToLearningAndLeading from './Section5YourApproachToLearningAndLeading';
import Section6Logistics from './Section6Logistics';
import Section7Submission from './Section7Submission';

export default class FacilitatorApplication1819 extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static submitButtonText = "Complete and Send";

  /**
   * @override
   */
  getPageComponents() {
    return [
      Section1QuestionsAboutYou,
      Section2ChooseYourProgram,
      Section3LeadingStudents,
      Section4FacilitationExperience,
      Section5YourApproachToLearningAndLeading,
      Section6Logistics,
      Section7Submission
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
  serializeFormData() {
    return {
      ...super.serializeFormData(),
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
