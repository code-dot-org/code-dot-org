import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3TeachingBackground from './Section3TeachingBackground';
import Section4ProfessionalLearningProgramRequirements from './Section4ProfessionalLearningProgramRequirements';
import Section5AdditionalDemographicInformation from './Section5AdditionalDemographicInformation';
import Section6Submission from './Section6Submission';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import queryString from 'query-string';
/* global ga */

export default class Teacher1920Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired
  };

  static submitButtonText = 'Complete and Send';

  static sessionStorageKey = 'Teacher1920Application';

  componentDidMount() {
    window.addEventListener('beforeunload', event => {
      if (!this.state.submitting) {
        event.preventDefault();
        const customWarning = `Are you sure? Your application may not be saved.`;
        event.returnValue = customWarning;
        return customWarning;
      }
    });
  }

  /**
   * @override
   */
  getPageComponents() {
    return [
      Section1AboutYou,
      Section3TeachingBackground,
      Section2ChooseYourProgram,
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
    const nominated = queryString.parse(window.location.search).nominated;

    // Report a unique page view to GA.
    let url = '/pd/application/teacher/';
    url += newPage + 1;
    if (nominated) {
      url += '?nominated=true';
    }

    ga('set', 'page', url);
    ga('send', 'pageview');
  }
}
