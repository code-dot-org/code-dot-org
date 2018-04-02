import React, {PropTypes} from 'react';
var VersionRow = require('./VersionRow');
var sourcesApi = require('../clientApi').sources;
var filesApi = require('../clientApi').files;
import project from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';

/**
 * A component for viewing project version history.
 */
var VersionHistory = React.createClass({
  propTypes: {
    handleClearPuzzle: PropTypes.func.isRequired,
    useFilesApi: PropTypes.bool.isRequired
  },

  /**
   * @returns {{statusMessage: string, versions: (null|{
   *   lastModified: Date,
   *   isLatest: boolean,
   *   versionId: string
   * }[])}}
   */
  getInitialState: function () {
    return {
      versions: null,
      statusMessage: '',
      showSpinner: true,
      confirmingClearPuzzle: false
    };
  },

  componentWillMount: function () {
    if (this.props.useFilesApi) {
      filesApi.getVersionHistory(this.onVersionListReceived, this.onAjaxFailure);
    } else {
      // TODO: Use Dave's client api when it's finished.
      sourcesApi.ajax('GET', 'main.json/versions', this.onVersionListReceived, this.onAjaxFailure);
    }
  },

  /**
   * Called after the component mounts, when the server responds with the
   * current list of versions.
   * @param xhr
   */
  onVersionListReceived: function (xhr) {
    this.setState({versions: JSON.parse(xhr.responseText), showSpinner: false});
  },

  /**
   * Called if the server responds with an error when loading an API request.
   */
  onAjaxFailure: function () {
    this.setState({statusMessage: 'An error occurred.'});
  },

  /**
   * Called when the server responds to a request to restore a previous version.
   */
  onRestoreSuccess: function () {
    location.reload();
  },

  /**
   * Called when the user chooses a previous version to restore.
   * @param versionId
   */
  onChooseVersion: function (versionId) {
    if (this.props.useFilesApi) {
      filesApi.restorePreviousVersion(versionId, this.onRestoreSuccess, this.onAjaxFailure);
    } else {
      sourcesApi.restorePreviousFileVersion('main.json', versionId, this.onRestoreSuccess, this.onAjaxFailure);
    }

    // Show the spinner.
    this.setState({showSpinner: true});
  },

  onConfirmClearPuzzle: function () {
    this.setState({confirmingClearPuzzle: true});
  },

  onCancelClearPuzzle: function () {
    this.setState({confirmingClearPuzzle: false});
  },

  onClearPuzzle: function () {
    this.setState({showSpinner: true});
    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v2',
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
      .then(() => location.reload());
  },

  render: function () {
    var body;
    if (this.state.showSpinner) {
      body = (
          <div style={{margin: '1em 0', textAlign: 'center'}}>
            <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
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
      var rows = this.state.versions.map(function (version) {
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
});
module.exports = VersionHistory;
