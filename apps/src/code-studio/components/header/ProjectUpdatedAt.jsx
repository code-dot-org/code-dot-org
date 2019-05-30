import Moment from 'react-moment';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import msg from '@cdo/locale';

import {projectUpdatedStatuses as statuses} from '../../headerRedux';

const styles = {
  container: {
    display: 'block',
    textAlign: 'left'
  }
};

class ProjectUpdatedAt extends React.Component {
  static propTypes = {
    locale: PropTypes.string,
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
            <Moment fromNow locale={this.props.locale || 'en'}>
              {this.props.updatedAt}
            </Moment>
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
      </div>
    );
  }
}

export default connect(state => ({
  locale: state.pageConstants && state.pageConstants.locale,
  status: state.header.projectUpdatedStatus,
  updatedAt: state.header.projectUpdatedAt
}))(ProjectUpdatedAt);
