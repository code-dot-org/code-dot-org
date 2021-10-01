/* globals appOptions */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import EditableProjectName from './EditableProjectName';
import ProjectImport from './ProjectImport';
import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';
import ProjectExport from './ProjectExport';

class ProjectHeader extends React.Component {
  static propTypes = {
    includeExportInProjectHeader: PropTypes.bool.isRequired,
    onChangedWidth: PropTypes.func
  };

  render() {
    const {includeExportInProjectHeader, onChangedWidth} = this.props;
    return (
      <div style={{display: 'flex'}}>
        <EditableProjectName onChangedWidth={onChangedWidth} />
        <ProjectShare />
        {includeExportInProjectHeader && <ProjectExport />}
        <ProjectRemix lightStyle />

        {/* For Minecraft Code Connection (aka CodeBuilder) projects, add the
            option to import code from an Hour of Code share link */}
        {appOptions.level.isConnectionLevel && <ProjectImport />}
      </div>
    );
  }
}

export const UnconnectedProjectHeader = ProjectHeader;
export default connect(
  state => ({
    includeExportInProjectHeader: state.header.includeExportInProjectHeader
  }),
  null
)(ProjectHeader);
