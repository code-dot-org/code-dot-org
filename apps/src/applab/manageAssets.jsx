var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

module.exports = React.createClass({
  propTypes: {
    assets: React.PropTypes.instanceOf(Array)
  },

  fileUploadClicked: function () {
    var uploader = document.querySelector('#uploader');
    uploader.click();
  },

  render: function() {
    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Manage Assets</p>
        <div style={{maxHeight: '330px', overflow: 'scroll', margin: '1em 0'}}>
          <table style={{width: '100%'}}>
            {this.props.assets.map(function (asset) {
              return <AssetRow name={asset.name} type={asset.type} src={asset.src}/>;
            })}
          </table>
        </div>
        <input type="file" id="uploader" style={{display: 'none'}}/>
        <button onClick={this.fileUploadClicked} className="share"><i className="fa fa-upload"></i> Upload File</button>
      </div>
    );
  }
});
