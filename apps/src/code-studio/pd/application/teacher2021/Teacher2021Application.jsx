import React from 'react';
import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import Section1AboutYou from './Section1AboutYou';
import Section2ChooseYourProgram from './Section2ChooseYourProgram';
import Section3TeachingBackground from './Section3TeachingBackground';
import Section4ProfessionalLearningProgramRequirements from './Section4ProfessionalLearningProgramRequirements';
import Section5AdditionalDemographicInformation from './Section5AdditionalDemographicInformation';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import queryString from 'query-string';
/* global ga */

export default class Teacher2021Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    accountEmail: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
    schoolId: PropTypes.string
  };

  static submitButtonText = 'Complete and Send';

  static sessionStorageKey = 'Teacher2021Application';

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
    // (even if value in sessionStorage is null)
    if (reloadedSchoolId === undefined && this.props.schoolId) {
      const schoolAutoFill = {school: this.props.schoolId};
      this.setState({data: {...this.state.data, ...schoolAutoFill}});
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
      Section5AdditionalDemographicInformation
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
        event: 'started-teacher2021-application'
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
    if (this.triedToSubmit) {
      // If errors exist, create a summary header containing
      // clickable links to pages that have errors.
      let invalidPages = this.validateForm();

      if (invalidPages.length) {
        this.setState({
          globalError: true,
          errorHeader: (
            <InvalidPagesSummary
              pages={invalidPages}
              setPage={this.setPage.bind(this)}
            />
          )
        });
      } else {
        this.setState({errorHeader: null, globalError: false});
      }
    }

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

  /**
   * @override
   */
  setPage(i) {
    const newPage = Math.min(
      Math.max(i, 0),
      this.getPageComponents().length - 1
    );

    this.setState({
      currentPage: newPage
    });

    this.saveToSessionStorage({currentPage: newPage});
  }

  /**
   * Find all pages that have errors.
   * @returns {number[]} array of page indexes
   */
  validateForm() {
    let invalidPages = [];

    // Validating page in reversed order because the last page being validated will overwrite
    // values in this form's state, and only errors found in that page will be highlighted.
    for (let i = this.getPageComponents().length - 1; i >= 0; i--) {
      if (!this.validatePageRequiredFields(i)) {
        invalidPages.unshift(i);
      }
    }

    return invalidPages;
  }

  /**
   * @override
   * @param {Event} event
   */
  handleSubmit(event) {
    event.preventDefault();

    this.triedToSubmit = true;
    let invalidPages = this.validateForm();

    if (invalidPages.length > 0) {
      // go to page with the smallest index
      this.setPage(invalidPages[0]);
    } else {
      super.handleSubmit(event);
    }
  }

  /**
   * @override
   */
  renderControlButtons() {
    return [super.renderControlButtons(), this.renderErrorFeedback()];
  }
}

const InvalidPagesSummary = ({pages, setPage}) => (
  <span>
    Please fill out all required fields on {pages.length > 1 ? 'pages' : 'page'}{' '}
    {pages
      .map(p => (
        <a key={p} onClick={() => setPage(p)} style={{cursor: 'pointer'}}>
          {p + 1}
        </a>
      ))
      .reduce((prev, curr) => [prev, ', ', curr])}
    . Once you are done, head to the last page to confirm and submit your
    application.
  </span>
);

InvalidPagesSummary.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.number).isRequired,
  setPage: PropTypes.func.isRequired
};
