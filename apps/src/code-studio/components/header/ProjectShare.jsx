/* globals dashboard */

import React from 'react';
import {shareProject} from '../../headerShare';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    shareProject(dashboard.project.getShareUrl());
  };

  render() {
    return (
      <div
        className="project_share header_button header_button_light"
        onClick={this.shareProject}
      >
        {dashboard.i18n.t('project.share')}
      </div>
    );
  }
}
