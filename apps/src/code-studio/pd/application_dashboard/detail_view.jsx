/**
 * Application Dashboard detail view
 * Route: /csd_facilitators/(:applicationId)
 *        /csd_teachers/(:applicationId)
 *        /csp_facilitators/(:applicationId)
 *        /csp_teachers/(:applicationId)
 */

import React, {PropTypes} from 'react';
import ApplicationLoader from './application_loader';
import DetailViewContents from "./detail_view_contents";

export default class DetailView extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired,
    route: PropTypes.shape({
      viewType: PropTypes.oneOf(['teacher', 'facilitator']),
      course: PropTypes.oneOf(['csf', 'csd', 'csp'])
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
    if (course !== this.props.route.course || application_type.toLowerCase() !== this.props.route.viewType) {
      this.context.router.replace(`/${course}_${application_type.toLowerCase()}s/${applicationId}`);
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
