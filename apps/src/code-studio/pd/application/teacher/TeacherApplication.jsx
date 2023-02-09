import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {assign, isEmpty} from 'lodash';
import FormController from '../../form_components_func/FormController';
import ChooseYourProgram from './ChooseYourProgram';
import FindYourRegion from './FindYourRegion';
import AboutYou from './AboutYou';
import AdditionalDemographicInformation from './AdditionalDemographicInformation';
import AdministratorInformation from './AdministratorInformation';
import ImplementationPlan from './ImplementationPlan';
import ProfessionalLearningProgramRequirements from './ProfessionalLearningProgramRequirements';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {reload} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
/* global ga */

const submitButtonText = 'Complete and Send';
const sessionStorageKey = 'TeacherApplication';
const pageComponents = [
  ChooseYourProgram,
  FindYourRegion,
  AboutYou,
  AdditionalDemographicInformation,
  AdministratorInformation,
  ImplementationPlan,
  ProfessionalLearningProgramRequirements
];
const autoComputedFields = [
  'regionalPartnerGroup',
  'regionalPartnerId',
  'regionalPartnerWorkshopIds'
];

const sendFirehoseEvent = (userId, event) => {
  firehoseClient.putRecord(
    {
      user_id: userId,
      study: 'application-funnel',
      event: event
    },
    {includeUserId: false}
  );
};

const TeacherApplication = props => {
  const {savedFormData, accountEmail, userId, savedStatus, schoolId} = props;

  const getInitialData = () => {
    const dataOnPageLoad = savedFormData && JSON.parse(savedFormData);

    // Extract school info saved in sessionStorage, if any
    const reloadedSchoolId = JSON.parse(
      sessionStorage.getItem(sessionStorageKey)
    )?.data?.school;

    // Populate additional data from server only if it doesn't override data in sessionStorage
    // (even if value in sessionStorage is null)
    // the FormController will handle loading reloadedSchoolId as an initial value, so return empty otherwise
    if (reloadedSchoolId === undefined && schoolId) {
      return {school: schoolId, ...dataOnPageLoad};
    } else {
      return {...dataOnPageLoad};
    }
  };

  const onInitialize = () => {
    sendFirehoseEvent(userId, 'started-teacher-application');
  };

  const getPageProps = () => ({
    accountEmail: accountEmail
  });

  const onSuccessfulSubmit = () => {
    // Let the server display a confirmation page as appropriate
    reload();

    sendFirehoseEvent(userId, 'submitted-teacher-application');
    analyticsReporter.sendEvent(EVENTS.APPLICATION_SUBMITTED_EVENT);
  };

  const onSuccessfulSave = () => {
    // only send firehose event on the first save of the teacher application
    !savedStatus && sendFirehoseEvent(userId, 'saved-teacher-application');
    analyticsReporter.sendEvent(EVENTS.APPLICATION_SAVED_EVENT);
  };

  const onSetPage = newPage => {
    const nominated = queryString.parse(window.location.search).nominated;

    // Report a unique page view to GA.
    let url = '/pd/application/teacher/';
    url += newPage + 1;

    const parameters = assign(
      {},
      nominated && {nominated: 'true'},
      savedStatus === 'incomplete' && {incomplete: 'true'}
    );
    if (!isEmpty(parameters)) {
      url += `?${queryString.stringify(parameters)}`;
    }

    ga('set', 'page', url);
    ga('send', 'pageview');
  };

  return (
    <FormController
      {...props}
      allowPartialSaving={true}
      pageComponents={pageComponents}
      autoComputedFields={autoComputedFields}
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
