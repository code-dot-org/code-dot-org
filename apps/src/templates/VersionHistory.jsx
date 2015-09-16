var React = require('react');
var VersionRow = require('./VersionRow.jsx');
var sourcesApi = require('../clientApi').sources;

/**
 * A component for viewing project version history.
 */
module.exports = React.createClass({
  propTypes: {
    handleClearPuzzle: React.PropTypes.func.isRequired,
    handleCloseDialog: React.PropTypes.func.isRequired
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
      confirmingClearPuzzle: false
    };
  },

  componentWillMount: function () {
    // TODO: Use Dave's client api when it's finished.
    sourcesApi.ajax('GET', 'main.json/versions', this.onVersionListReceived, this.onAjaxFailure);
  },

  /**
   * Called after the component mounts, when the server responds with the
   * current list of versions.
   * @param xhr
   */
  onVersionListReceived: function (xhr) {
    this.setState({versions: JSON.parse(xhr.responseText)});
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
    // TODO: Use Dave's client api when it's finished.
    sourcesApi.ajax('PUT', 'main.json/restore?version=' + versionId, this.onRestoreSuccess, this.onAjaxFailure);

    // Show the spinner.
    this.setState({versions: null});
  },

  onConfirmClearPuzzle: function () {
    this.setState({confirmingClearPuzzle: true});
  },

  onCancelClearPuzzle: function () {
    this.setState({confirmingClearPuzzle: false});
  },

  onClearPuzzle: function () {
    this.props.handleClearPuzzle();
    this.props.handleCloseDialog();
  },

  render: function () {
    var versionList;
    if (this.state.confirmingClearPuzzle) {
      versionList = (
        <div>
          <p>Are you sure you want to clear all progress for this level&#63;</p>
          <button id="confirm-button" style={{float: 'right'}} onClick={this.onClearPuzzle}>Start Over</button>
          <button id="again-button" onClick={this.onCancelClearPuzzle}>Cancel</button>
        </div>
      );
    // If `this.state.versions` is null, the versions are still loading.
    } else if (this.state.versions === null) {
      versionList = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
        </div>
      );
    } else {
      var rows = this.state.versions.map(function (version) {
        return <VersionRow
          lastModified={new Date(version.lastModified)}
          isLatest={version.isLatest}
          onChoose={this.onChooseVersion.bind(this, version.versionId)} />;
      }.bind(this));

      versionList = (
        <div>
          <div style={{maxHeight: '330px', overflowX: 'scroll', margin: '1em 0'}}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
                <tr>
                  <td>
                    <p>Default version</p>
                  </td>
                  <td width="250" style={{textAlign: 'right'}}>
                  <button className="btn-danger" onClick={this.onConfirmClearPuzzle} style={{float: 'right'}}>
                    Delete Progress
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
        {versionList}
        {this.state.statusMessage}
      </div>
    );
  }
});
