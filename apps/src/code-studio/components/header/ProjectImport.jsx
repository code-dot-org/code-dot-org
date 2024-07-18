import $ from 'jquery';
import React from 'react';

import i18n from '@cdo/locale';

import {convertBlocksXml} from '../../../craft/code-connection/utils';

/**
 * Show a popup dialog to collect an Hour of Code share link, and create a new
 * channel-backed project from the associated LevelSource.
 *
 * Currently only supported for Minecraft Code Connection Projects and Minecraft
 * Agent share links
 */
export default class ProjectImport extends React.Component {
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
          i18n.projectShareLinkImportBadLinkHeader(),
          i18n.projectShareLinkImportBadLinkBody()
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

      const onFinish = function (source) {
        // Source data will likely be from a different project type than this one,
        // so convert it

        const convertedSource = convertBlocksXml(source);
        dashboard.project.createNewChannelFromSource(
          convertedSource,
          function (channelData) {
            const pathName =
              dashboard.project.appToProjectUrl() +
              '/' +
              channelData.id +
              '/edit';
            location.href = pathName;
          }
        );
      };

      const onError = function () {
        Craft.showErrorMessagePopup(
          i18n.projectShareLinkImportErrorHeader(),
          i18n.projectShareLinkImportErrorBody()
        );
      };

      // Depending on what kind of source the share link resolved to (if it even
      // did), retrieve the source and process it
      if (levelSourcePath) {
        // level sources can be grabbed with a simple ajax request
        $.ajax({
          url: levelSourcePath,
          type: 'get',
          dataType: 'json',
        })
          .done(function (data) {
            onFinish(data.data);
          })
          .error(function () {
            onError();
          });
      } else if (channelId) {
        // channel-backed sources need to go through the project API
        dashboard.project.getSourceForChannel(channelId, function (source) {
          if (source) {
            onFinish(source);
          } else {
            onError();
          }
        });
      } else {
        Craft.showErrorMessagePopup(
          i18n.projectShareLinkImportBadLinkHeader(),
          i18n.projectShareLinkImportBadLinkBody()
        );
      }
    });
  };
  render() {
    return (
      <div
        className="project_import header_button header_button_light"
        onClick={this.importProject}
      >
        {i18n.import()}
      </div>
    );
  }
}
