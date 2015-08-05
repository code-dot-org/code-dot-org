var React = require('react');
var VersionRow = require('./VersionRow.jsx');
var sourcesApi = require('../clientApi')('sources');

/**
 * A component for viewing project version history.
 */
module.exports = React.createClass({

  getInitialState: function () {
    return {
      versions: null,
      statusMessage: ''
    };
  },

  componentWillMount: function () {
    // TODO: Use Dave's client api when it's finished.
    sourcesApi.ajax('GET', 'main.xml/versions', this.onVersionListReceived, this.onVersionListFailure);
  },

  /**
   * Called after the component mounts, when the server responds with the
   * current list of assets.
   * @param xhr
   */
  onVersionListReceived: function (xhr) {
    this.setState({versions: JSON.parse(xhr.responseText)});
  },

  /**
   * Called after the component mounts, if the server responds with an error
   * when loading the current list of assets.
   */
  onVersionListFailure: function () {
    this.setState({statusMessage: 'Error loading version list.'});
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
        var choose = function () {
          // TODO:
          console.log('picked', version.versionId, version.lastModified);
        };

        return <VersionRow
          lastModified={new Date(Date.parse(version.lastModified))}
          onChoose={choose} />;
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
