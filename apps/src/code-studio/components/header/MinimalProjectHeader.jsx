import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';

import ProjectRemix from './ProjectRemix';

// Minimal project header for viewing channel shares and legacy /c/ share pages.
class MinimalProjectHeader extends React.Component {
  static propTypes = {
    legacyProjectName: PropTypes.string,
    lab2ProjectName: PropTypes.string,
    inRestrictedShareMode: PropTypes.bool,
  };

  render() {
    const {inRestrictedShareMode, legacyProjectName, lab2ProjectName} =
      this.props;
    // Only one of legacyProjectName and lab2ProjectName will be defined.
    const projectName = legacyProjectName || lab2ProjectName;

    return (
      <div style={{display: 'flex'}}>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">{projectName}</div>
          {!inRestrictedShareMode && (
            <div className="project_updated_at header_text">
              {i18n.clickToRemix()}
            </div>
          )}
        </div>
        <ProjectRemix />
      </div>
    );
  }
}

export default connect(state => ({
  legacyProjectName: state.project.projectName,
  lab2ProjectName: state.lab.channel && state.lab.channel.name,
  inRestrictedShareMode: state.project && state.project.inRestrictedShareMode,
}))(MinimalProjectHeader);
