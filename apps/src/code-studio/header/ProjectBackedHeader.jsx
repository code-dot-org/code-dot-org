/* globals dashboard */

import React from 'react';

import ProjectRemix from './ProjectRemix';

// Project header for script levels that are backed by a project. Shows a Share
// and Remix button, and should be used with the version of ScriptName that
// places a last_modified time below the stage name
export default class ProjectBackedHeader extends React.Component {
  shareProject = () => {
    // TODO
  };

  render() {
    return (
      <div>
        <div
          className="project_share header_button header_button_light"
          onClick={this.shareProject}
        >
          {dashboard.i18n.t('project.share')}
        </div>
        <ProjectRemix lightStyle />
      </div>
    );
  }
}
