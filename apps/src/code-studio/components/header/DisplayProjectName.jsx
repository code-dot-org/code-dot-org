/**
 * Displays the current project name and a button to begin editing it.
 * This should only be shown when the project name is not being edited.
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import ProjectUpdatedAt from './ProjectUpdatedAt';

import styles from './project-header.module.scss';

export default class DisplayProjectName extends React.Component {
  static propTypes = {
    beginEdit: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={styles.buttonWrapper}>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            {this.props.projectName}
          </div>
          <ProjectUpdatedAt />
        </div>
        <button
          type="button"
          className={classNames(
            styles.buttonSpacing,
            'project_edit',
            'header_button',
            'header_button_light',
            'no-mc'
          )}
          onClick={this.props.beginEdit}
        >
          {i18n.rename()}
        </button>
      </div>
    );
  }
}
