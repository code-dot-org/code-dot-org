/* globals dashboard */

import React from 'react';
import i18n from '@cdo/locale';
import {exportProject} from '../../headerExport';

export default class ProjectExport extends React.Component {
  exportProject = () => {
    exportProject(dashboard.project.getShareUrl());
  };

  render() {
    return (
      <div
        className="project_share header_button header_button_light"
        onClick={this.exportProject}
      >
        {i18n.export()}
      </div>
    );
  }
}
