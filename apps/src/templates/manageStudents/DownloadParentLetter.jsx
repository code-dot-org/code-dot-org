import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {ParentLetterEntryPoint} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetter extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    buttonLocation: PropTypes.oneOf(Object.values(ParentLetterEntryPoint))
  };

  onDownloadParentLetter = () => {
    const url = teacherDashboardUrl(this.props.sectionId, '/parent_letter');
    window.open(url, '_blank');
    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students-actions',
        event: 'download-parent-letter-button',
        data_json: JSON.stringify({
          sectionId: this.props.sectionId,
          entryPoint: this.props.buttonLocation
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          onClick={this.onDownloadParentLetter}
          target="_blank"
          color={Button.ButtonColor.gray}
          text={i18n.downloadParentLetter()}
          icon="file-text"
        />
      </div>
    );
  }
}
