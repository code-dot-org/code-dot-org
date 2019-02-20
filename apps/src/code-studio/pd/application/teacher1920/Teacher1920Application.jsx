import React from 'react';
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

    if (this.triedToSubmit) {
      let pageWithErrors = this.validateForm();

      // If errors exist, create a summary header containing
      // clickable links to pages that have errors.
      if (pageWithErrors.length) {
        this.setState({
          globalError: true,
          errorHeader: (
            <span>
              Please fill out all required fields on page
              {pageWithErrors.length > 1 ? 's' : ''}{' '}
              {pageWithErrors.map(index => (
                <a
                  key={index}
                  onClick={() => this.setPage(index)}
                  style={{cursor: 'pointer'}}
                >
                  {' '}
                  {index + 1}
                </a>
              ))}
              . Once you are done, head to the last page to confirm and submit
              your application.
            </span>
          )
        });
      } else {
        this.setState({errorHeader: null, globalError: false});
      }
    }

    this.saveToSessionStorage({currentPage: newPage});
  }

  /**
   * Find all pages that have errors.
   * @returns {number[]} array of page indexes
   */
  validateForm() {
    let pageWithErrors = [];

    // Validating page in reversed order because the last page being validated will overwrite
    // values in this form's state, and only errors found in that page will be highlighted.
    for (let i = this.getPageComponents().length - 1; i >= 0; i--) {
      if (!this.validatePageRequiredFields(i)) {
        pageWithErrors.unshift(i);
      }
    }

    return pageWithErrors;
  }

  /**
   * @override
   * @param {Event} event
   */
  handleSubmit(event) {
    event.preventDefault();

    this.triedToSubmit = true;
    let pageWithErrors = this.validateForm();

    if (pageWithErrors.length > 0) {
      // go to page with the smallest index
      this.setPage(pageWithErrors[0]);
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
