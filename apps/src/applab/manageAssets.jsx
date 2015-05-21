var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

var errorMessages = {
  415: 'This type of file is not supported.'
};

function getErrorMessage(status) {
  return errorMessages[status] || 'An unknown error occurred.';
}

module.exports = React.createClass({
  propTypes: {
    assets: React.PropTypes.instanceOf(Array)
  },

  getInitialState: function () {
    return {
      assets: this.props.assets,
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
    xhr.addEventListener('load', (function () {
      this.state.assets.push({name: file.name, type: 'unknown'});
      this.setState({uploadStatus: 'File "' + file.name + '" successfully uploaded!'});
    }).bind(this));
    xhr.addEventListener('error', (function () {
      this.setState({uploadStatus: 'Error uploading file: ' + getErrorMessage(xhr.status)});
    }).bind(this));

    xhr.open('PUT', '/v3/assets/' + dashboard.project.current.id + '/' + file.name, true);
    xhr.send(file);
    this.setState({uploadStatus: 'Uploading...'});
  },

  deleteFile: function (name) {
    console.log('delete', name); // TODO: Remove!
    this.setState({
      assets: this.state.assets.filter(function (asset) {
        return asset.name !== name;
      })
    });
  },

  render: function() {
    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Manage Assets</p>
        <div style={{maxHeight: '330px', overflow: 'scroll', margin: '1em 0'}}>
          <table style={{width: '100%'}}>
            <tbody>
              {this.state.assets.map(function (asset) {
                return <AssetRow key={asset.name} name={asset.name} type={asset.type} src={asset.src} delete={this.deleteFile.bind(this, asset.name)}/>;
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <input type="file" id="uploader" style={{display: 'none'}} onChange={this.upload}/>
        <button onClick={this.fileUploadClicked} className="share"><i className="fa fa-upload"></i> Upload File</button>
        <span id="uploadStatus" style={{margin: '0 10px'}}>{this.state.uploadStatus}</span>
      </div>
    );
  }
});
