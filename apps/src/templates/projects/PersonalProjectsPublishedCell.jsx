import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import i18n from '@cdo/locale';
import {showPublishDialog} from './publishDialog/publishDialogRedux';
import {unpublishProject} from './projectsRedux';

class PersonalProjectsPublishedCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    isPublishable: PropTypes.bool.isRequired,
    showPublishDialog: PropTypes.func.isRequired,
    unpublishProject: PropTypes.func.isRequired
  };

  onPublish = () => {
    this.props.showPublishDialog(this.props.projectId, this.props.projectType);
  };

  onUnpublish = () => {
    this.props.unpublishProject(this.props.projectId);
  };

  render() {
    const {isPublished, isPublishable} = this.props;
    const showPublishButton = !isPublished && isPublishable;
    const showUnpublishButton = isPublished && isPublishable;

    return (
      <div>
        {showPublishButton && (
          <Button
            __useDeprecatedTag
            onClick={this.onPublish}
            color={Button.ButtonColor.gray}
            text={i18n.publish()}
            className="ui-personal-projects-publish-button"
          />
        )}
        {showUnpublishButton && (
          <Button
            __useDeprecatedTag
            onClick={this.onUnpublish}
            color={Button.ButtonColor.gray}
            text={i18n.unpublish()}
            className="ui-personal-projects-unpublish-button"
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    showPublishDialog(projectId, projectType) {
      dispatch(showPublishDialog(projectId, projectType));
    },
    unpublishProject(projectId) {
      dispatch(unpublishProject(projectId));
    }
  })
)(PersonalProjectsPublishedCell);
