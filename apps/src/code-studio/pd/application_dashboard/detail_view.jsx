/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 *        /csa_teachers/(:applicationId)
 *        /incomplete_applications/(:applicationId)
 */

import PropTypes from 'prop-types';
import React from 'react';
import ApplicationLoader from './application_loader';
import DetailViewContents from './detail_view_contents';
import {CourseKeyMap} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {getPathToApplication} from '@cdo/apps/code-studio/pd/application_dashboard/pathToApplicationHelper';

export default class DetailView extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired,
    route: PropTypes.shape({
      viewType: PropTypes.oneOf(['teacher', 'facilitator']),
      course: PropTypes.oneOf([...Object.values(CourseKeyMap), 'course_tbd'])
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleApplicationLoaded = applicationData => {
    const {course, application_type} = applicationData;
    const applicationId = this.props.params.applicationId;

    // Wrong course or application type? No problem. Redirect to the correct route.
    // Note this will re-query the API for application data
    if (
      course !== this.props.route.course ||
      application_type.toLowerCase() !== this.props.route.viewType
    ) {
      this.context.router.replace(
        getPathToApplication(course, application_type, applicationId)
      );
    }
  };

  renderApplication = ({applicationData, handleUpdate}) => (
    <DetailViewContents
      applicationId={this.props.params.applicationId}
      viewType={this.props.route.viewType}
      applicationData={applicationData}
      onUpdate={handleUpdate}
    />
  );

  render() {
    return (
      <ApplicationLoader
        applicationId={this.props.params.applicationId}
        onApplicationLoaded={this.handleApplicationLoaded}
        renderApplication={this.renderApplication}
      />
    );
  }
}
