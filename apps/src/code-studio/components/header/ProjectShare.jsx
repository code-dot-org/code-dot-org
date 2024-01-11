import React from 'react';
import i18n from '@cdo/locale';
import {shareProject} from '../../headerShare';
import styles from './project-header.module.scss';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import classNames from 'classnames';

export default class ProjectShare extends React.Component {
  shareProject = () => {
    if (Lab2Registry.hasEnabledProjects()) {
      // If we are using Lab2, share using the project manager and
      // shareLab2Project.
      shareLab2Project(
        Lab2Registry.getInstance().getProjectManager().getShareUrl()
      );
    } else {
      // Otherwise, we are using the legacy labs system, get the share url from that system
      // and share using shareProject.
      shareProject(dashboard.project.getShareUrl());
    }
  };

  render() {
    return (
      <button
        type="button"
        className={classNames(
          styles.buttonSpacing,
          'project_share',
          'header_button',
          'header_button_light',
          'no-mc'
        )}
        onClick={this.shareProject}
      >
        {i18n.share()}
      </button>
    );
  }
}
