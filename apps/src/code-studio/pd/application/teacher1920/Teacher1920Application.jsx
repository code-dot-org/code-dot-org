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

  /**
   * @override
   */
  componentWillMount() {
    super.componentWillMount();

    // Extract school info saved in sessionStorage, if any
    let reloadedSchoolId = undefined;
    if (
      this.constructor.sessionStorageKey &&
      sessionStorage[this.constructor.sessionStorageKey]
    ) {
      const reloadedState = JSON.parse(
        sessionStorage[this.constructor.sessionStorageKey]
      );
      reloadedSchoolId = reloadedState.data.school;
    }

    // Populate data from server only if it doesn't override data in sessionStorage
    if (reloadedSchoolId === undefined && this.props.options.school_id) {
      const autofill = {school: this.props.options.school_id};
      this.setState({data: {...this.state.data, ...autofill}});
    }
  }

  componentDidMount() {
    window.addEventListener('beforeunload', event => {
      if (!this.state.submitting) {
        event.preventDefault();
        event.returnValue = 'Are you sure? Your application may not be saved.';
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
