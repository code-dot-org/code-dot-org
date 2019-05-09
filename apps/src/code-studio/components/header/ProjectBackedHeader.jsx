import React from 'react';

import ProjectShare from './ProjectShare';
import ProjectRemix from './ProjectRemix';

// Project header for script levels that are backed by a project. Shows a Share
// and Remix button, and should be used with the version of ScriptName that
// places a last_modified time below the stage name
export default class ProjectBackedHeader extends React.Component {
  render() {
    return (
      <div>
        <ProjectShare />
        <ProjectRemix lightStyle />
      </div>
    );
  }
}
