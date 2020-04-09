import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetters extends Component {
  static propTypes = {
    sectionId: PropTypes.number
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
          sectionId: this.props.sectionId
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
