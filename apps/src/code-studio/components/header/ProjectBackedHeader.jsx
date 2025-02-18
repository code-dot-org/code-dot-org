import React from 'react';

import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';

// Project header for script levels that are backed by a project.
// Shows Share and Remix buttons,
// and should be used with the version of ScriptName that
// places a last_modified time below the lesson name
export default class ProjectBackedHeader extends React.Component {
  render() {
    return (
      <div style={styles.projectButtons}>
        <ProjectShare />
        <ProjectRemix lightStyle />
      </div>
    );
  }
}

const styles = {
  projectButtons: {
    display: 'flex',
  },
};
