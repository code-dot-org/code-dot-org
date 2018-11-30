import React, {PropTypes} from 'react';
import VersionRow from './VersionRow';
import {sources as sourcesApi, files as filesApi} from '../clientApi';
import project from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import * as utils from '../utils';

/**
 * A component for viewing project version history.
 */
export default class VersionHistory extends React.Component {
  static propTypes = {
    handleClearPuzzle: PropTypes.func.isRequired,
    useFilesApi: PropTypes.bool.isRequired
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
    confirmingClearPuzzle: false
  };

  componentWillMount() {
    if (this.props.useFilesApi) {
      filesApi.getVersionHistory(this.onVersionListReceived, this.onAjaxFailure);
    } else {
      // TODO: Use Dave's client api when it's finished.
      sourcesApi.ajax('GET', 'main.json/versions', this.onVersionListReceived, this.onAjaxFailure);
    }
  }

  /**
   * Called after the component mounts, when the server responds with the
   * current list of versions.
   * @param xhr
   */
  onVersionListReceived = (xhr) => {
    this.setState({versions: JSON.parse(xhr.responseText), showSpinner: false});
  };

  /**
   * Called if the server responds with an error when loading an API request.
   */
  onAjaxFailure = () => {
    this.setState({statusMessage: 'An error occurred.'});
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
  onChooseVersion = (versionId) => {
    if (this.props.useFilesApi) {
      filesApi.restorePreviousVersion(versionId, this.onRestoreSuccess, this.onAjaxFailure);
    } else {
      sourcesApi.restorePreviousFileVersion('main.json', versionId, this.onRestoreSuccess, this.onAjaxFailure);
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
    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v4',
        event: 'clear-puzzle',
        project_id: project.getCurrentId(),
        data_json: JSON.stringify({
          isOwner: project.isOwner(),
          currentUrl: window.location.href,
          shareUrl: project.getShareUrl(),
          currentSourceVersionId: project.getCurrentSourceVersionId(),
        }),
      },
      {includeUserId: true}
    );

    this.props.handleClearPuzzle()
      .then(() => project.save(true))
      .then(() => utils.reload());
  };

  render() {
    let body;
    if (this.state.showSpinner) {
      body = (
          <div style={{margin: '1em 0', textAlign: 'center'}}>
            <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}/>
          </div>
      );
    } else if (this.state.confirmingClearPuzzle) {
      body = (
        <div>
          <p>Are you sure you want to clear all progress for this level&#63;</p>
          <button id="confirm-button" style={{float: 'right'}} onClick={this.onClearPuzzle}>Start Over</button>
          <button id="again-button" onClick={this.onCancelClearPuzzle}>Cancel</button>
        </div>
      );
    } else {
      const rows = this.state.versions.map(function (version) {
        return (
          <VersionRow
            key={version.versionId}
            versionId={version.versionId}
            lastModified={new Date(version.lastModified)}
            isLatest={version.isLatest}
            onChoose={this.onChooseVersion.bind(this, version.versionId)}
          />
        );
      }.bind(this));

      body = (
        <div>
          <div style={{maxHeight: '330px', overflowX: 'scroll', margin: '1em 0'}}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
                <tr>
                  <td>
                    <p style={{margin: 0}}>Initial version</p>
                  </td>
                  <td width="250" style={{textAlign: 'right'}}>
                  <button className="btn-danger" onClick={this.onConfirmClearPuzzle} style={{float: 'right'}}>
                    Start over
                  </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Version History</p>
        {body}
        {this.state.statusMessage}
      </div>
    );
  }
}
