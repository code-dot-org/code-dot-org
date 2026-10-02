import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import project from '@cdo/apps/code-studio/initApp/project';
import TimeAgo from '@cdo/apps/templates/TimeAgo';
import msg from '@cdo/locale';

import {projectUpdatedStatuses as statuses} from '../../projectRedux';

import RetryProjectSaveDialog from './RetryProjectSaveDialog';

class ProjectUpdatedAt extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(Object.values(statuses)),
    updatedAt: PropTypes.string,
    onContentUpdated: PropTypes.func,
  };

  componentDidMount() {
    if (this.props.onContentUpdated) {
      this.props.onContentUpdated();
    }
  }

  componentDidUpdate() {
    if (this.props.onContentUpdated) {
      this.props.onContentUpdated();
    }
  }

  renderText() {
    if (this.props.status === statuses.error) {
      return (
        <span
          className="project-save-error"
          title={msg.projectSaveErrorTooltip()}
        >
          <i className="fa-solid fa-triangle-exclamation" />
          &nbsp;
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
        <RetryProjectSaveDialog onTryAgain={() => project.save()} />
      </div>
    );
  }
}

/** The badge's floor; a header that reserves its room reads it from here. */
export const PROJECT_UPDATED_AT_MIN_WIDTH = 160;

const styles = {
  container: {
    display: 'block',
    // A floor, not a cap: in some locales the badge is wider.
    minWidth: PROJECT_UPDATED_AT_MIN_WIDTH,
    height: 14,
    overflow: 'visible',
  },
};

export default connect(state => ({
  status: state.project.projectUpdatedStatus,
  updatedAt: state.project.projectUpdatedAt,
}))(ProjectUpdatedAt);
