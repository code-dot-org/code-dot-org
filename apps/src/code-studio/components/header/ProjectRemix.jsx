/* globals dashboard, appOptions */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import * as utils from '../../../utils';
import {refreshProjectName} from '../../headerRedux';
import {styles} from './EditableProjectName';

class ProjectRemix extends React.Component {
  static propTypes = {
    isSignedIn: PropTypes.bool,
    lightStyle: PropTypes.bool,
    refreshProjectName: PropTypes.func.isRequired
  };

  remixProject = () => {
    if (
      dashboard.project.getCurrentId() &&
      dashboard.project.canServerSideRemix()
    ) {
      dashboard.project.serverSideRemix();
    } else if (!this.props.isSignedIn) {
      utils.navigateToHref(
        `/users/sign_in?user_return_to=${window.location.pathname}`
      );
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
        .then(() => this.props.refreshProjectName())
        .catch(err => console.log(err));
    }
  };

  render() {
    let className = 'project_remix header_button no-mc';
    if (this.props.lightStyle) {
      className += ' header_button_light';
    }
    return (
      <button
        type="button"
        className={className}
        onClick={this.remixProject}
        style={styles.buttonSpacing}
      >
        {i18n.remix()}
      </button>
    );
  }
}

export const UnconnectedProjectRemix = ProjectRemix;
export default connect(
  state => ({
    isSignedIn: state.pageConstants && state.pageConstants.isSignedIn
  }),
  {refreshProjectName}
)(ProjectRemix);
