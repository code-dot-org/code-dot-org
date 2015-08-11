var React = require('react');
var VersionRow = require('./VersionRow.jsx');
var sourcesApi = require('../clientApi')('sources');

/**
 * A component for viewing project version history.
 */
module.exports = React.createClass({
  propTypes: {},

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
      statusMessage: ''
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

  render: function () {
    var versionList;
    // If `this.state.versions` is null, the versions are still loading.
    if (this.state.versions === null) {
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
