var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

module.exports = React.createClass({
  propTypes: {
    assets: React.PropTypes.instanceOf(Array)
  },

  render: function() {
    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Manage Assets</p>
        <table style={{width: '100%', margin: '1em 0'}}>
          <tr>
            <th width="50">Thumbnail</th>
            <th>Filename</th>
            <th width="250">Actions</th>
          </tr>
          {this.props.assets.map(function (asset) {
            return <AssetRow name={asset.name} type={asset.type} src={asset.src}/>;
          })}
        </table>
        <button className="share"><i className="fa fa-upload"></i> Upload File</button>
      </div>
    );
  }
});
