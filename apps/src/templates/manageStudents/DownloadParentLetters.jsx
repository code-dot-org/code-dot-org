import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetters extends Component {
  static propTypes = {
    numStudents: PropTypes.number.isRequired,
    sectionId: PropTypes.number
  };

  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          href={teacherDashboardUrl(this.props.sectionId, '/parent_letter')}
          target="_blank"
          color={Button.ButtonColor.gray}
          text={i18n.downloadParentLetter()}
          icon="file-text"
        />
      </div>
    );
  }
}
