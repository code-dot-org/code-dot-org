/* globals dashboard, appOptions */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectImport from './ProjectImport';
import ProjectRemix from './ProjectRemix';
import ProjectShare from './ProjectShare';
import ProjectUpdatedAt from './ProjectUpdatedAt';

class ProjectHeader extends React.Component {
  static propTypes = {
    projectName: PropTypes.string.isRequired
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have finished editing the name, refresh the 'updated at' timestamp
    // TODO we can probably do this without going through dashboard.header
    if (this.state.editName === false && prevState.editName === true) {
      dashboard.header.updateTimestamp();
    }
  }

  state = {
    name: dashboard.project.getCurrentName(),
    editName: false,
    savingName: false
  };

  beginEdit = () => {
    this.setState({
      editName: true,
      savingName: false
    });
  };

  changeName = event => {
    this.setState({
      name: event.target.value
    });
  };

  saveNameChange = () => {
    const newName = this.state.name.trim().substr(0, 100);
    if (newName.length === 0) {
      return;
    }

    dashboard.project.rename(newName, () => {
      this.setState({
        name: dashboard.project.getCurrentName(),
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
      return (
        <input
          type="text"
          className="project_name header_input"
          maxLength="100"
          value={this.state.name}
          onChange={this.changeName}
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

export default connect(state => ({
  projectName: state.header.projectName
}))(ProjectHeader);
