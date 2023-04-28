/* globals dashboard */

import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';
import {styles} from './EditableProjectName';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    shareProject(dashboard.project.getShareUrl());
  };

  render() {
    return (
      <button
        type="button"
        className="project_share header_button header_button_light no-mc"
        onClick={this.shareProject}
        style={styles.buttonSpacing}
      >
        {i18n.share()}
      </button>
    );
  }
}
