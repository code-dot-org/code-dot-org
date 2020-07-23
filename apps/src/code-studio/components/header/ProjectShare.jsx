/* globals dashboard */

import React from 'react';
import i18n from '@cdo/locale';
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
        {i18n.share()}
      </div>
    );
  }
}
