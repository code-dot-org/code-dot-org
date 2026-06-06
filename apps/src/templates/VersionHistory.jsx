import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import project from '@cdo/apps/code-studio/initApp/project';
import i18n from '@cdo/locale';

import {sources as sourcesApi, files as filesApi} from '../clientApi';
import * as utils from '../utils';

import VersionRow from './VersionRow';

/**
 * A component for viewing project version history.
 */
export default class VersionHistory extends React.Component {
  static propTypes = {
    handleClearPuzzle: PropTypes.func.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    selectedVersion: PropTypes.string,
    isReadOnly: PropTypes.bool.isRequired,
  };

  /**
   * {
   *   statusMessage: string,
   *   versions: (null|{
   *     lastModified: Date,
   *     isLatest: boolean,
   *     versionId: string
   *   }[]),
   *   showSpinner: boolean,
   *   confirmingClearPuzzle: boolean,
   * }
   */
  state = {
    versions: null,
    statusMessage: '',
    showSpinner: true,
    confirmingClearPuzzle: false,
  };

  UNSAFE_componentWillMount() {
    if (this.props.useFilesApi) {
      filesApi.getVersionHistory(
        this.onVersionListReceived,
        this.onAjaxFailure
      );
    } else {
      // TODO: Use Dave's client api when it's finished.
      sourcesApi.ajax(
        'GET',
        'main.json/versions',
        this.onVersionListReceived,
        this.onAjaxFailure
      );
    }
  }

  /**
   * Called after the component mounts, when the server responds with the
   * current list of versions.
   * @param xhr
   */
  onVersionListReceived = xhr => {
    this.setState({versions: JSON.parse(xhr.responseText), showSpinner: false});
  };

  /**
   * Called if the server responds with an error when loading an API request.
   */
  onAjaxFailure = () => {
    this.setState({statusMessage: i18n.versionHistory_ajaxFailure()});
  };

  /**
   * Called when the server responds to a request to restore a previous version.
   */
  onRestoreSuccess = () => {
    utils.reload();
  };

  /**
   * Called when the user chooses a previous version to restore.
   * @param versionId
   */
  onChooseVersion = versionId => {
    if (this.props.useFilesApi) {
      filesApi.restorePreviousVersion(
        versionId,
        this.onRestoreSuccess,
        this.onAjaxFailure
      );
    } else {
      sourcesApi.restorePreviousFileVersion(
        'main.json',
        versionId,
        this.onRestoreSuccess,
        this.onAjaxFailure
      );
    }

    // Show the spinner.
    this.setState({showSpinner: true});
  };

  onConfirmClearPuzzle = () => {
    this.setState({confirmingClearPuzzle: true});
  };

  onCancelClearPuzzle = () => {
    this.setState({confirmingClearPuzzle: false});
  };

  onClearPuzzle = () => {
    this.setState({showSpinner: true});

    this.props
      .handleClearPuzzle()
      .then(() => project.save(true))
      .then(() => utils.reload());
  };

  render() {
    let title;
    let body;
    if (this.state.showSpinner) {
      title = i18n.versionHistory_header();
      body = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{fontSize: '32px'}}
          />
        </div>
      );
    } else if (this.state.confirmingClearPuzzle) {
      title = i18n.versionHistory_clearProgress_header();
      body = (
        <div>
          <MuiTypography variant="body1">
            {i18n.versionHistory_clearProgress_prompt()}
          </MuiTypography>
          {this.props.isProjectTemplateLevel && (
            <MuiTypography variant="body1" className="template-level-warning">
              {i18n.versionHistory_clearProgress_templateLevelWarning()}
            </MuiTypography>
          )}
          <MuiButton
            type="button"
            color="error"
            variant="contained"
            id="start-over-button"
            style={{marginLeft: 0}}
            onClick={this.onClearPuzzle}
          >
            {i18n.versionHistory_clearProgress_confirm()}
          </MuiButton>
          <MuiButton
            type="button"
            color="secondary"
            variant="outlined"
            id="again-button"
            style={{float: 'right'}}
            onClick={this.onCancelClearPuzzle}
          >
            {i18n.versionHistory_clearProgress_cancel()}
          </MuiButton>
        </div>
      );
    } else {
      title = i18n.versionHistory_header();

      const rows = this.state.versions.map(
        function (version) {
          return (
            <VersionRow
              key={version.versionId}
              versionId={version.versionId}
              lastModified={new Date(version.lastModified)}
              isLatest={version.isLatest}
              isSelectedVersion={
                this.props.selectedVersion
                  ? version.versionId === this.props.selectedVersion
                  : version.isLatest
              }
              isReadOnly={this.props.isReadOnly}
              onChoose={this.onChooseVersion.bind(this, version.versionId)}
            />
          );
        }.bind(this)
      );

      body = (
        <div>
          <div style={{maxHeight: '330px', overflowX: 'auto', margin: '1em 0'}}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
                {!this.props.isReadOnly && (
                  <tr>
                    <td>
                      <MuiTypography variant="body1">
                        {i18n.versionHistory_initialVersion_label()}
                      </MuiTypography>
                    </td>
                    <td width="250" style={{textAlign: 'right'}}>
                      <MuiButton
                        type="button"
                        color="error"
                        variant="contained"
                        onClick={this.onConfirmClearPuzzle}
                        style={{float: 'right'}}
                      >
                        {i18n.versionHistory_clearProgress_confirm()}
                      </MuiButton>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-content" style={{margin: 0}}>
        <MuiTypography variant="h5" className="dialog-title">
          {title}
        </MuiTypography>
        {body}
        <MuiTypography variant="body2" className="caption-text">
          {this.state.statusMessage}
        </MuiTypography>
      </div>
    );
  }
}
