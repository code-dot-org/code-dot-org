import React from 'react';
import PropTypes from 'prop-types';
import FormController from '../../form_components_func/FormController';
import AboutYou from './AboutYou';
import ChooseYourProgram from './ChooseYourProgram';
import ProfessionalLearningProgramRequirements from './ProfessionalLearningProgramRequirements';
import AdditionalDemographicInformation from './AdditionalDemographicInformation';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import queryString from 'query-string';
/* global ga */

const submitButtonText = 'Complete and Send';
const sessionStorageKey = 'TeacherApplication';
const pageComponents = [
  AboutYou,
  ChooseYourProgram,
  ProfessionalLearningProgramRequirements,
  AdditionalDemographicInformation
];

const TeacherApplication = props => {
  const {accountEmail, userId, schoolId} = props;

  const getInitialData = () => {
    // Extract school info saved in sessionStorage, if any
    let reloadedSchoolId = undefined;
    if (sessionStorage.getItem(sessionStorageKey)) {
      const reloadedState = JSON.parse(
        sessionStorage.getItem(sessionStorageKey)
      );
      reloadedSchoolId = reloadedState.data.school;
    }

    // Populate additional data from server only if it doesn't override data in sessionStorage
    // (even if value in sessionStorage is null)
    // the FormController will handle loading reloadedSchoolId as an initial value, so return empty otherwise
    if (reloadedSchoolId === undefined && schoolId) {
      return {school: schoolId};
    }

    return {};
  };

  const onInitialize = () => {
    // Log the user ID to firehose.
    firehoseClient.putRecord(
      {
        user_id: userId,
        study: 'application-funnel',
        event: 'started-teacher-application'
      },
      {includeUserId: false}
    );
  };

  const getPageProps = () => ({
    accountEmail: accountEmail
  });

  const onSuccessfulSubmit = () => {
    // Let the server display a confirmation page as appropriate
    window.location.reload(true);
  };

  const onSuccessfulSave = () => {
    // [MEG] TODO: Figure out what should happen on save
    // Right now, reload page to render in_progress page (to verify)
    window.location.reload(true);
  };

  const onSetPage = newPage => {
    const nominated = queryString.parse(window.location.search).nominated;

    // Report a unique page view to GA.
    let url = '/pd/application/teacher/';
    url += newPage + 1;
    if (nominated) {
      url += '?nominated=true';
    }

    ga('set', 'page', url);
    ga('send', 'pageview');
  };

  return (
    <FormController
      {...props}
      pageComponents={pageComponents}
      getPageProps={getPageProps}
      getInitialData={getInitialData}
      onSetPage={onSetPage}
      onInitialize={onInitialize}
      onSuccessfulSubmit={onSuccessfulSubmit}
      onSuccessfulSave={onSuccessfulSave}
      sessionStorageKey={sessionStorageKey}
      submitButtonText={submitButtonText}
      validateOnSubmitOnly={true}
      warnOnExit={true}
    />
  );
};
TeacherApplication.propTypes = {
  ...FormController.propTypes,
  accountEmail: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
  schoolId: PropTypes.string
};

export default TeacherApplication;
