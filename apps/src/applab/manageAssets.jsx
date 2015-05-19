var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

module.exports = React.createClass({
  propTypes: {
    assets: React.PropTypes.instanceOf(Array)
  },

  render: function() {
    return (
      <div>
        <p>Manage Assets</p>
        <table>
          {this.props.assets.map(function (asset) {
            return <AssetRow name={asset.name}/>;
          })}
        </table>
      </div>
    );
  }
});
