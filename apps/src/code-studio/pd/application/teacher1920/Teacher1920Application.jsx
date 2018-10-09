import {PropTypes} from 'react';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3TeachingBackground from './Section3TeachingBackground';
import Section4ProfessionalLearningProgramRequirements from './Section4ProfessionalLearningProgramRequirements';
import Section5AdditionalDemographicInformation from './Section5AdditionalDemographicInformation';
import Section6Submission from './Section6Submission';

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
      Section1AboutYou,
      Section2ChooseYourProgram,
      Section3TeachingBackground,
      Section4ProfessionalLearningProgramRequirements,
      Section5AdditionalDemographicInformation,
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
