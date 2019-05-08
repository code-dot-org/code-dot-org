/* globals dashboard, appOptions, Craft */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {shareProject} from '../headerShare';
import {convertBlocksXml} from '../craft/code-connection/utils';

import ProjectUpdatedAt from './ProjectUpdatedAt';
import ProjectRemix from './ProjectRemix';

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

  shareProject = () => {
    shareProject(dashboard.project.getShareUrl());
  };

  /**
   * Show a popup dialog to collect an Hour of Code share link, and create a new
   * channel-backed project from the associated LevelSource.
   *
   * Currently only supported for Minecraft Code Connection Projects and Minecraft
   * Agent share links
   */
  importProject = () => {
    if (!Craft) {
      return;
    }

    Craft.showImportFromShareLinkPopup(shareLink => {
      if (!shareLink) {
        return;
      }

      let sharePath;
      try {
        const anchor = document.createElement('a');
        anchor.href = shareLink;
        sharePath = anchor.pathname;
      } catch (e) {
        // a shareLink that does not represent a valid URL will throw a TypeError
        Craft.showErrorMessagePopup(
          dashboard.i18n.t('project.share_link_import_bad_link_header'),
          dashboard.i18n.t('project.share_link_import_bad_link_body')
        );
        return;
      }

      const legacyShareRegex = /^\/?c\/([^\/]*)/;
      const obfuscatedShareRegex = /^\/?r\/([^\/]*)/;
      const projectShareRegex = /^\/?projects\/minecraft_hero\/([^\/]*)/;

      let levelSourcePath, channelId;

      // Try a couple different kinds of share links, resolving to either a level
      // source or channel
      if (sharePath.match(legacyShareRegex)) {
        const levelSourceId = sharePath.match(legacyShareRegex)[1];
        levelSourcePath = `/c/${levelSourceId}.json`;
      } else if (sharePath.match(obfuscatedShareRegex)) {
        const levelSourceId = sharePath.match(obfuscatedShareRegex)[1];
        levelSourcePath = `/r/${levelSourceId}.json`;
      } else if (sharePath.match(projectShareRegex)) {
        channelId = sharePath.match(projectShareRegex)[1];
      }

      const onFinish = function(source) {
        // Source data will likely be from a different project type than this one,
        // so convert it

        const convertedSource = convertBlocksXml(source);
        dashboard.project.createNewChannelFromSource(convertedSource, function(
          channelData
        ) {
          const pathName =
            dashboard.project.appToProjectUrl() +
            '/' +
            channelData.id +
            '/edit';
          location.href = pathName;
        });
      };

      const onError = function() {
        Craft.showErrorMessagePopup(
          dashboard.i18n.t('project.share_link_import_error_header'),
          dashboard.i18n.t('project.share_link_import_error_body')
        );
      };

      // Depending on what kind of source the share link resolved to (if it even
      // did), retrieve the source and process it
      if (levelSourcePath) {
        // level sources can be grabbed with a simple ajax request
        $.ajax({
          url: levelSourcePath,
          type: 'get',
          dataType: 'json'
        })
          .done(function(data) {
            onFinish(data.data);
          })
          .error(function() {
            onError();
          });
      } else if (channelId) {
        // channel-backed sources need to go through the project API
        dashboard.project.getSourceForChannel(channelId, function(source) {
          if (source) {
            onFinish(source);
          } else {
            onError();
          }
        });
      } else {
        Craft.showErrorMessagePopup(
          dashboard.i18n.t('project.share_link_import_bad_link_header'),
          dashboard.i18n.t('project.share_link_import_bad_link_body')
        );
      }
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
        <div
          className="project_share header_button header_button_light"
          onClick={this.shareProject}
        >
          {dashboard.i18n.t('project.share')}
        </div>
        <ProjectRemix lightStyle />

        {/* For Minecraft Code Connection (aka CodeBuilder) projects, add the
            option to import code from an Hour of Code share link */}
        {appOptions.level.isConnectionLevel && (
          <div
            className="project_import header_button header_button_light"
            onClick={this.importProject}
          >
            {dashboard.i18n.t('project.import')}
          </div>
        )}

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
