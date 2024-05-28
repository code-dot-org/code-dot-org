import PropTypes from 'prop-types';
import React from 'react';

import EditableProjectName from './EditableProjectName';
import ProjectImport from './ProjectImport';
import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';

export default class ProjectHeader extends React.Component {
  static propTypes = {
    onChangedWidth: PropTypes.func,
  };

  render() {
    const {onChangedWidth} = this.props;
    return (
      <div style={{display: 'flex'}}>
        <EditableProjectName onChangedWidth={onChangedWidth} />
        <ProjectShare />
        <ProjectRemix lightStyle />

        {/* For Minecraft Code Connection (aka CodeBuilder) projects, add the
            option to import code from an Hour of Code share link */}
        {window.appOptions && appOptions.level.isConnectionLevel && (
          <ProjectImport />
        )}
      </div>
    );
  }
}
