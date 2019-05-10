/* globals dashboard, appOptions */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectImport from './ProjectImport';
import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';
import ProjectUpdatedAt from './ProjectUpdatedAt';

import {refreshProjectName} from '../../headerRedux';

class ProjectHeader extends React.Component {
  static propTypes = {
    projectName: PropTypes.string.isRequired,
    refreshProjectName: PropTypes.func.isRequired
  };

  state = {
    editName: false,
    savingName: false
  };

  beginEdit = () => {
    this.setState({
      editName: true,
      savingName: false
    });
  };

  saveNameChange = () => {
    const newName = this.nameChangeInput.value.trim().substr(0, 100);
    if (newName.length === 0) {
      return;
    }

    dashboard.project.rename(newName, () => {
      dashboard.header.updateTimestamp();
      this.props.refreshProjectName();
      this.setState({
        editName: false,
        savingName: false
      });
    });

    this.setState({
      savingName: true
    });
  };

  renderProjectName() {
    if (this.state.editName) {
      // Use an uncontrolled input for the "rename" operation so our UI tests
      // can easily interface with it
      return (
        <input
          type="text"
          className="project_name header_input"
          maxLength="100"
          defaultValue={this.props.projectName}
          ref={input => {
            this.nameChangeInput = input;
          }}
        />
      );
    }

    return (
      <div className="project_name header_text">{this.props.projectName}</div>
    );
  }

  renderSaveOrEdit() {
    if (this.state.editName) {
      return (
        <div
          className="project_save header_button header_button_light"
          onClick={this.saveNameChange}
          disabled={this.state.savingName}
        >
          {dashboard.i18n.t('project.save')}
        </div>
      );
    }

    return (
      <div
        className="project_edit header_button header_button_light"
        onClick={this.beginEdit}
      >
        {dashboard.i18n.t('project.rename')}
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="project_name_wrapper header_text">
          {this.renderProjectName()}
          {!this.state.editName && <ProjectUpdatedAt />}
        </div>
        {this.renderSaveOrEdit()}
        <ProjectShare />
        <ProjectRemix lightStyle />

        {/* For Minecraft Code Connection (aka CodeBuilder) projects, add the
            option to import code from an Hour of Code share link */}
        {appOptions.level.isConnectionLevel && <ProjectImport />}

        {/* TODO: Remove this (and the related style) when Web Lab is no longer
            in beta.*/}
        {appOptions.app === 'weblab' && (
          <div className="beta-notice">{dashboard.i18n.t('beta')}</div>
        )}
      </div>
    );
  }
}

export const UnconnectedProjectHeader = ProjectHeader;
export default connect(
  state => ({
    projectName: state.header.projectName
  }),
  {
    refreshProjectName
  }
)(ProjectHeader);
