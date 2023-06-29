import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';
import {styles} from './EditableProjectName';
import LabRegistry from '@cdo/apps/labs/LabRegistry';
import {shareProjectV2} from '@cdo/apps/labs/header/headerShareV2';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    if (LabRegistry.getInstance().getProjectManager() !== null) {
      // If we have a project manager, share using the project manager and
      // shareProjectV2.
      shareProjectV2(
        LabRegistry.getInstance().getProjectManager().getShareUrl()
      );
    } else {
      // Otherwise, we are using the legacy projects system, get the share url from that system
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
