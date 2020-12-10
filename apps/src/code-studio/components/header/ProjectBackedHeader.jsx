import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectShare from './ProjectShare';
import ProjectExport from './ProjectExport';
import ProjectRemix from './ProjectRemix';

const styles = {
  projectButtons: {
    display: 'flex'
  }
};

// Project header for script levels that are backed by a project. Shows a Share,
// Export, and Remix button, and should be used with the version of ScriptName that
// places a last_modified time below the stage name
class ProjectBackedHeader extends React.Component {
  static propTypes = {
    includeExportInProjectHeader: PropTypes.bool.isRequired
  };

  render() {
    const {includeExportInProjectHeader} = this.props;
    return (
      <div style={styles.projectButtons}>
        <ProjectShare />
        {includeExportInProjectHeader && <ProjectExport />}
        <ProjectRemix lightStyle />
      </div>
    );
  }
}

export const UnconnectedProjectBackedHeader = ProjectBackedHeader;
export default connect(state => ({
  includeExportInProjectHeader: state.header.includeExportInProjectHeader
}))(ProjectBackedHeader);
