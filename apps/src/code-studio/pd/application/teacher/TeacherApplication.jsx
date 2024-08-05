import {assign, isEmpty} from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {reload} from '@cdo/apps/utils';

import FormController from '../../form_components_func/FormController';

import AboutYou from './AboutYou';
import AdditionalDemographicInformation from './AdditionalDemographicInformation';
import AdministratorInformation from './AdministratorInformation';
import ChooseYourProgram from './ChooseYourProgram';
import FindYourRegion from './FindYourRegion';
import ImplementationPlan from './ImplementationPlan';
import ProfessionalLearningProgramRequirements from './ProfessionalLearningProgramRequirements';

const submitButtonText = 'Complete and Send';
const sessionStorageKey = 'TeacherApplication';
const hasLoggedTeacherAppStart = 'hasLoggedTeacherAppStart';
const pageComponents = [
  ChooseYourProgram,
  FindYourRegion,
  AboutYou,
  AdditionalDemographicInformation,
  AdministratorInformation,
  ImplementationPlan,
  ProfessionalLearningProgramRequirements,
];
const autoComputedFields = [
  'regionalPartnerGroup',
  'regionalPartnerId',
  'regionalPartnerWorkshopIds',
];

const TeacherApplication = props => {
  const {savedFormData, accountEmail, savedStatus, schoolId} = props;

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
    if (!sessionStorage.getItem(hasLoggedTeacherAppStart)) {
      sessionStorage.setItem(hasLoggedTeacherAppStart, true);
      analyticsReporter.sendEvent(EVENTS.TEACHER_APP_VISITED_EVENT);
    }
  };

  const getPageProps = () => ({
    accountEmail: accountEmail,
  });

  const onSuccessfulSubmit = () => {
    // Let the server display a confirmation page as appropriate
    reload();

    analyticsReporter.sendEvent(EVENTS.APPLICATION_SUBMITTED_EVENT);
  };

  const onSuccessfulSave = () => {
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
  schoolId: PropTypes.string,
};

export default TeacherApplication;
