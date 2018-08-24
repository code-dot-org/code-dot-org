import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import i18n from '@cdo/locale';
import {showPublishDialog} from './publishDialog/publishDialogRedux';
import {unpublishProject} from './projectsRedux';
import {publishMethods} from './projectConstants';
import firehoseClient from '@cdo/apps/lib/util/firehose';

class PersonalProjectsPublishedCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    isPublishable: PropTypes.bool.isRequired,
    publishMethod: PropTypes.oneOf([publishMethods.CHEVRON, publishMethods.BUTTON]).isRequired,
    showPublishDialog: PropTypes.func.isRequired,
    unpublishProject: PropTypes.func.isRequired,
    userId: PropTypes.number,
  };

  onPublish = () => {
    firehoseClient.putRecord(
      {
        study: 'project-publish',
        study_group: 'publish-button',
        event: 'publish',
        user_id: this.props.userId,
        data_json: JSON.stringify({ channel_id: this.props.projectId })
      }
    );
    this.props.showPublishDialog(this.props.projectId, this.props.projectType);
  };

  onUnpublish = () => {
    firehoseClient.putRecord(
      {
        study: 'project-publish',
        study_group: 'publish-button',
        event: 'unpublish',
        user_id: this.props.userId,
        data_json: JSON.stringify({ channel_id: this.props.projectId })
      }
    );
    this.props.unpublishProject(this.props.projectId);
  };

  render() {
    const {isPublished, isPublishable, publishMethod} = this.props;
    const showPublishButton = !isPublished && publishMethod === 'button' && isPublishable;
    const showUnpublishButton = isPublished && publishMethod === 'button' && isPublishable;
    const showCheckMark = isPublished && publishMethod === 'chevron';

    return (
      <div>
        {showCheckMark &&
          <FontAwesome icon="check"/>
        }
        {showPublishButton &&
          <Button
            onClick={this.onPublish}
            color={Button.ButtonColor.gray}
            text={i18n.publish()}
          />
        }
        {showUnpublishButton &&
          <Button
            onClick={this.onUnpublish}
            color={Button.ButtonColor.gray}
            text={i18n.unpublish()}
          />
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  showPublishDialog(projectId, projectType) {
    dispatch(showPublishDialog(projectId, projectType));
  },
  unpublishProject(projectId) {
    dispatch(unpublishProject(projectId));
  },
}))(PersonalProjectsPublishedCell);
