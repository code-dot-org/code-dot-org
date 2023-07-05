import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';
import {styles} from './EditableProjectName';
import LabRegistry from '@cdo/apps/labs/LabRegistry';
import {shareLab2Project} from '@cdo/apps/labs/header/lab2HeaderShare';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    if (LabRegistry.hasEnabledProjects()) {
      // If we are using Lab2, share using the project manager and
      // shareLab2Project.
      shareLab2Project(
        LabRegistry.getInstance().getProjectManager().getShareUrl()
      );
    } else {
      // Otherwise, we are using the legacy labs system, get the share url from that system
      // and share using shareProject.
      shareProject(dashboard.project.getShareUrl());
    }
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
