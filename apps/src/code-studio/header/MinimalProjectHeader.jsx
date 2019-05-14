/* globals dashboard, appOptions */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

// Minimal project header for viewing channel shares and legacy /c/ share pages.
class MinimalProjectHeader extends React.Component {
  static propTypes = {
    isSignedIn: PropTypes.bool
  };

  state = {
    currentName: undefined
  };

  remixProject = () => {
    if (
      dashboard.project.getCurrentId() &&
      dashboard.project.canServerSideRemix()
    ) {
      dashboard.project.serverSideRemix();
    } else if (!this.props.isSignedIn) {
      window.location = `/users/sign_in?user_return_to=${
        window.location.pathname
      }`;
    } else {
      // We don't have an id. This implies we are either on a legacy /c/ share
      // page or a script level. In these cases, copy will create a new project
      // for us.
      const newName =
        'Remix: ' +
        (dashboard.project.getCurrentName() ||
          appOptions.level.projectTemplateLevelName ||
          'My Project');
      dashboard.project
        .copy(newName, {shouldNavigate: true})
        .then(() => this.setState({currentName: newName}))
        .catch(err => console.log(err));
    }
  };

  render() {
    return (
      <div>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            {this.state.currentName || dashboard.project.getCurrentName()}
          </div>
          <div className="project_updated_at header_text">
            {dashboard.i18n.t('project.click_to_remix')}
          </div>
        </div>
        <div
          className="project_remix header_button"
          onClick={this.remixProject}
        >
          {dashboard.i18n.t('project.remix')}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  isSignedIn: state.pageConstants && state.pageConstants.isSignedIn
}))(MinimalProjectHeader);
