import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectShare from './ProjectShare';
import ProjectExport from './ProjectExport';
import ProjectRemix from './ProjectRemix';

// Project header for script levels that are backed by a project. Shows a Share,
// Export, and Remix button, and should be used with the version of UnitName that
// places a last_modified time below the lesson name
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

const styles = {
  projectButtons: {
    display: 'flex'
  }
};

export const UnconnectedProjectBackedHeader = ProjectBackedHeader;
export default connect(state => ({
  includeExportInProjectHeader: state.header.includeExportInProjectHeader
}))(ProjectBackedHeader);
