/* globals dashboard */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectRemix from './ProjectRemix';

// Minimal project header for viewing channel shares and legacy /c/ share pages.
class MinimalProjectHeader extends React.Component {
  static propTypes = {
    projectName: PropTypes.string.isRequired
  };

  render() {
    return (
      <div>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            {this.props.projectName}
          </div>
          <div className="project_updated_at header_text">
            {dashboard.i18n.t('project.click_to_remix')}
          </div>
        </div>
        <ProjectRemix />
      </div>
    );
  }
}

export default connect(state => ({
  projectName: state.header.projectName
}))(MinimalProjectHeader);
