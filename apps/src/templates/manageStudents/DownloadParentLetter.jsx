import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {ParentLetterButtonMetricsCategory} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

export default class DownloadParentLetter extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    buttonMetricsCategory: PropTypes.oneOf(
      Object.values(ParentLetterButtonMetricsCategory)
    ),
  };

  onDownloadParentLetter = () => {
    const url = teacherDashboardUrl(this.props.sectionId, '/parent_letter');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  render() {
    return (
      <MuiButton
        variant="outlined"
        color="tertiary"
        size="small"
        onClick={this.onDownloadParentLetter}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="file-lines" />}
      >
        {i18n.downloadParentLetter()}
      </MuiButton>
    );
  }
}
