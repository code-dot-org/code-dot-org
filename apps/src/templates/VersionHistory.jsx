var React = require('react');
var VersionRow = require('./VersionRow.jsx');
var sourcesApi = require('../clientApi')('sources');

/**
 * A component for viewing project version history.
 */
module.exports = React.createClass({

  getInitialState: function () {
    return {
      versions: [{
        versionId: 'JIlHTUjtd7qEpqnAmT8_YFmiQD668Zzg',
        lastModified: '2015-08-04T22:20:39Z'
      }, {
        versionId: 'P_5XB3Ql5HpF8fmqe.lSUaltXCj8M2.z',
        lastModified: '2015-08-04T22:20:38Z'
      }]
    };
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
      </div>
    );
  }
});
