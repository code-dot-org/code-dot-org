import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3TeachingBackground from './Section3TeachingBackground';
import Section4ProfessionalLearningProgramRequirements from './Section4ProfessionalLearningProgramRequirements';
import Section5AdditionalDemographicInformation from './Section5AdditionalDemographicInformation';
import Section6Submission from './Section6Submission';
import firehoseClient from '@cdo/apps/lib/util/firehose';
/* global ga */

export default class Teacher1920Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired
  };

  static submitButtonText = 'Complete and Send';

  static sessionStorageKey = 'Teacher1920Application';

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
  onInitialize() {
    // Log the user ID to firehose.
    firehoseClient.putRecord(
      {
        user_id: this.props.userId,
        study: 'application-funnel',
        event: 'started-teacher1920-application'
      },
      {includeUserId: false}
    );
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
  onSetPage(newPage) {
    // Report a unique page view to GA.
    ga('set', 'page', '/pd/application/teacher/' + (newPage + 1));
    ga('send', 'pageview');
  }
}
