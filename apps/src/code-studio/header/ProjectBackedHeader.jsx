/* globals dashboard */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

// Project header for script levels that are backed by a project. Shows a Share
// and Remix button, and places a last_modified time below the stage name
class ProjectBackedHeader extends React.Component {
  static propTypes = {
    isSignedIn: PropTypes.bool
  };

  shareProject = () => {
    // TODO
  };

  remixProject = () => {
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
        <div
          className="project_remix header_button header_button_light"
          onClick={this.remixProject}
        >
          dashboard.i18n.t('project.remix')
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  isSignedIn: state.pageConstants && state.pageConstants.isSignedIn
}))(ProjectBackedHeader);
