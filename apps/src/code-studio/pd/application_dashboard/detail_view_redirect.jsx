/**
 * Generic detail view url, loads and then redirects to the appropriate course_type url
 * Route: /:applicationId
 * Redirects to: /{course}{application_type}/:applicationId
 *   e.g. /csf_facilitators/1
 */

import React, {PropTypes} from 'react';
import ApplicationLoader from './application_loader';

export default class DetailViewRedirect extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleApplicationLoaded = (applicationData) => {
    const {course, application_type} = applicationData;
    const applicationId = this.props.params.applicationId;

    // Redirect to the specific course_type route, e.g. csf_facilitators
    this.context.router.replace(`/${course}_${application_type.toLowerCase()}s/${applicationId}`);
  };

  render() {
    return (
      <ApplicationLoader
        applicationId={this.props.params.applicationId}
        onApplicationLoaded={this.handleApplicationLoaded}
      />
    );
  }
}
