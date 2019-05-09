import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import msg from '@cdo/locale';

import {projectUpdatedStatuses as statuses} from '../headerRedux';

const styles = {
  defaultContainer: {
    display: 'block',
    textAlign: 'left'
  },
  hiddenContainer: {
    display: 'none'
  }
};

class ProjectUpdatedAt extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(Object.values(statuses)),
    updatedAt: PropTypes.string
  };

  componentDidUpdate() {
    // TODO replace this with a React implementation
    if (this.props.updatedAt) {
      $('.project_updated_at span.timestamp').timeago();
    }
  }

  renderText() {
    if (this.props.status === statuses.error) {
      const saveErrorTooltip =
        "It looks like we couldn't save your progress. Make sure you have a " +
        'good internet connection and try running the project again to save it.';
      return (
        <span className="project-save-error" title={saveErrorTooltip}>
          <i className="fa fa-exclamation-triangle" />
          Error saving project
        </span>
      );
    }

    if (this.props.status === statuses.saving) {
      return msg.saving();
    }

    if (this.props.status === statuses.saved && this.props.updatedAt) {
      return (
        <div>
          {msg.savedToGallery()}{' '}
          <span className="timestamp" title={this.props.updatedAt} />
        </div>
      );
    }

    return 'Not saved';
  }

  render() {
    const style = styles.defaultContainer;
    //const style = this.props.show
    //  ? styles.defaultContainer
    //  : styles.hiddenContainer;

    return (
      <div className="project_updated_at header_text" style={style}>
        {this.renderText()}
      </div>
    );
  }
}

export default connect(state => ({
  status: state.header.projectUpdatedStatus,
  updatedAt: state.header.projectUpdatedAt
}))(ProjectUpdatedAt);
