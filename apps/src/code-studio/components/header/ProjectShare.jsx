import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';
import {styles} from './EditableProjectName';
import LabRegistry from '@cdo/apps/labs/LabRegistry';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    let shareUrl;
    if (LabRegistry.getInstance().getProjectManager() !== null) {
      // If we have a project manager, use that for the share url.
      shareUrl = LabRegistry.getInstance().getProjectManager().getShareUrl();
    } else {
      // Otherwise, we are using the legacy projects system, get the share url from that system.
      shareUrl = dashboard.project.getShareUrl();
    }
    shareProject(shareUrl);
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
