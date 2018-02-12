/**
 * Application Dashboard admin edit view
 * Route: /:applicationId/edit
 */

import React, {PropTypes} from 'react';
import ApplicationLoader from './application_loader';
import FormDataEdit from './form_data_edit';

export default class AdminEditView extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      applicationId: PropTypes.string.isRequired
    }).isRequired
  };

  renderApplication = ({applicationData}) => (
    <FormDataEdit
      applicationId={this.props.params.applicationId}
      applicationData={applicationData}
    />
  );

  render() {
    return (
      <ApplicationLoader
        applicationId={this.props.params.applicationId}
        renderApplication={this.renderApplication}
        loadRawFormData={true}
      />
    );
  }
}
