import PropTypes from 'prop-types';
import React from 'react';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

import FormController from '../../form_components_func/FormController';

import PrincipalApprovalComponent from './PrincipalApprovalComponent';

const PrincipalApprovalApplication = props => {
  const getInitialData = () => ({
    firstName: props.teacherApplication.principal_first_name,
    lastName: props.teacherApplication.principal_last_name,
    title: props.teacherApplication.principal_title,
    role: props.teacherApplication.principal_role,
    email: props.teacherApplication.principal_email,
    course: props.teacherApplication.course,
    school: props.teacherApplication.school_id,
    schoolZipCode: props.teacherApplication.school_zip_code,
    totalStudentEnrollment: props.teacherApplicationSchoolStats.students_total,
    freeLunchPercent: props.teacherApplicationSchoolStats.frl_eligible_percent,
    white: props.teacherApplicationSchoolStats.white_percent,
    black:
      props.teacherApplicationSchoolStats.black_or_african_american_percent,
    hispanic: props.teacherApplicationSchoolStats.hispanic_or_latino_percent,
    asian: props.teacherApplicationSchoolStats.asian_percent,
    pacificIslander:
      props.teacherApplicationSchoolStats
        .native_hawaiian_or_pacific_islander_percent,
    americanIndian:
      props.teacherApplicationSchoolStats
        .american_indian_alaskan_native_percent,
    other: props.teacherApplicationSchoolStats.two_or_more_races_percent,
  });

  const pageComponents = [PrincipalApprovalComponent];

  const getPageProps = () => {
    return {
      teacherApplication: props.teacherApplication,
    };
  };

  const serializeApplicationId = () => {
    return {
      application_guid: props.teacherApplication.application_guid,
    };
  };

  const onSuccessfulSubmit = () => {
    analyticsReporter.sendEvent(EVENTS.ADMIN_APPROVAL_RECEIVED_EVENT);
    analyticsReporter.sendEvent(EVENTS.APP_STATUS_CHANGE_EVENT, {
      'application id': props.teacherApplication.id,
      'application status': 'unreviewed',
    });
    window.location.reload(true);
  };

  return (
    <FormController
      {...props}
      pageComponents={pageComponents}
      getPageProps={getPageProps}
      getInitialData={getInitialData}
      serializeAdditionalData={serializeApplicationId}
      onSuccessfulSubmit={onSuccessfulSubmit}
      validateOnSubmitOnly={true}
      warnOnExit={true}
    />
  );
};
PrincipalApprovalApplication.propTypes = {
  apiEndpoint: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  teacherApplication: PropTypes.shape({
    id: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    application_guid: PropTypes.string.isRequired,
    principal_first_name: PropTypes.string.isRequired,
    principal_last_name: PropTypes.string.isRequired,
    principal_title: PropTypes.string,
    principal_role: PropTypes.string,
    principal_email: PropTypes.string.isRequired,
    school_id: PropTypes.string,
    school_zip_code: PropTypes.string,
  }).isRequired,
  teacherApplicationSchoolStats: PropTypes.shape({
    students_total: PropTypes.string,
    frl_eligible_percent: PropTypes.string,
    white_percent: PropTypes.string,
    black_or_african_american_percent: PropTypes.string,
    hispanic_or_latino_percent: PropTypes.string,
    asian_percent: PropTypes.string,
    native_hawaiian_or_pacific_islander_percent: PropTypes.string,
    american_indian_alaskan_native_percent: PropTypes.string,
    two_or_more_races_percent: PropTypes.string,
  }).isRequired,
};
export default PrincipalApprovalApplication;
