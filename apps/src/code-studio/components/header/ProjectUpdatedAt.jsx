import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import msg from '@cdo/locale';

import TimeAgo from '@cdo/apps/templates/TimeAgo';

import {projectUpdatedStatuses as statuses} from '../../headerRedux';
import RetryProjectSaveDialog from './RetryProjectSaveDialog';

class ProjectUpdatedAt extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(Object.values(statuses)),
    updatedAt: PropTypes.string
  };

  renderText() {
    if (this.props.status === statuses.error) {
      return (
        <span
          className="project-save-error"
          title={msg.projectSaveErrorTooltip()}
        >
          <i className="fa fa-exclamation-triangle" />
          {msg.projectSaveError()}
        </span>
      );
    }

    if (this.props.status === statuses.saving) {
      return msg.saving();
    }

    if (this.props.status === statuses.saved) {
      return (
        <div>
          {msg.savedToGallery()}{' '}
          {this.props.updatedAt && (
            <TimeAgo dateString={this.props.updatedAt} />
          )}
        </div>
      );
    }

    return msg.notSaved();
  }

  render() {
    return (
      <div className="project_updated_at header_text" style={styles.container}>
        {this.renderText()}
        <RetryProjectSaveDialog />
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'block',
    textAlign: 'left'
  }
};

export default connect(state => ({
  status: state.header.projectUpdatedStatus,
  updatedAt: state.header.projectUpdatedAt
}))(ProjectUpdatedAt);
