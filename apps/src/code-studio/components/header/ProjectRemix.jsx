import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import i18n from '@cdo/locale';

import * as utils from '../../../utils';
import {refreshProjectName} from '../../projectRedux';

import styles from './project-header.module.scss';

class ProjectRemix extends React.Component {
  static propTypes = {
    isSignedIn: PropTypes.bool,
    lightStyle: PropTypes.bool,
    refreshProjectName: PropTypes.func.isRequired,
    inRestrictedShareMode: PropTypes.bool,
  };

  remixProject = () => {
    if (Lab2Registry.hasEnabledProjects()) {
      this.remixLab2Project();
    } else {
      this.remixLegacyProject();
    }
  };

  remixLegacyProject = () => {
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

  remixLab2Project = () => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      projectManager.flushSave().then(() => {
        projectManager.redirectToRemix();
      });
    }
  };

  render() {
    const {lightStyle, inRestrictedShareMode} = this.props;
    let className = 'project_remix header_button no-mc';
    if (lightStyle) {
      className += ' header_button_light';
    }
    return !inRestrictedShareMode ? (
      <button
        type="button"
        className={classNames(styles.buttonSpacing, className)}
        onClick={this.remixProject}
      >
        {i18n.remix()}
      </button>
    ) : null;
  }
}

export const UnconnectedProjectRemix = ProjectRemix;
export default connect(
  state => ({
    isSignedIn: state.pageConstants && state.pageConstants.isSignedIn,
    inRestrictedShareMode: state.project && state.project.inRestrictedShareMode,
  }),
  {refreshProjectName}
)(ProjectRemix);
