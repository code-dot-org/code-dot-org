var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

module.exports = React.createClass({
  propTypes: {
    assets: React.PropTypes.instanceOf(Array)
  },

  getInitialState: function () {
    return {
      uploadStatus: ''
    };
  },

  fileUploadClicked: function () {
    var uploader = document.querySelector('#uploader');
    uploader.click();
  },

  upload: function () {
    var file = document.querySelector('#uploader').files[0];
    var uploadStatus = document.querySelector('#uploadStatus');

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', '/v3/assets/' + dashboard.project.current.id + '/' + file.name, true);
    xhr.addEventListener('load', (function () {
      this.props.assets.push({name: file.name, type: 'unknown'});
      this.setState({uploadStatus: 'File "' + file.name + '" successfully uploaded!'});
    }).bind(this));

    xhr.send(file);
    this.setState({uploadStatus: 'Uploading...'});
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
        <input type="file" id="uploader" style={{display: 'none'}} onChange={this.upload}/>
        <button onClick={this.fileUploadClicked} className="share"><i className="fa fa-upload"></i> Upload File</button>
        <span id="uploadStatus" style={{margin: '0 10px'}}>{this.state.uploadStatus}</span>
      </div>
    );
  }
});
