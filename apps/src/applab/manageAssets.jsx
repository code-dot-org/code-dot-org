var React = require('react');

var AssetRow = require('./manageAssets/assetRow.jsx');

var errorMessages = {
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.'
};

function getErrorMessage(status) {
  return errorMessages[status] || 'An unknown error occurred.';
}

module.exports = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      assets: null,
      uploadStatus: ''
    };
  },

  componentWillMount: function () {
    // TODO: Use Dave's client api when it's finished.
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (function () {
      this.setState({assets: JSON.parse(xhr.responseText)});
    }).bind(this));
    xhr.addEventListener('error', (function () {
      this.setState({uploadStatus: 'Error loading asset list: ' + getErrorMessage(xhr.status)});
    }).bind(this));

    xhr.open('GET', '/v3/assets/' + dashboard.project.current.id, true);
    xhr.send();
  },

  fileUploadClicked: function () {
    var uploader = document.querySelector('#uploader');
    uploader.click();
  },

  upload: function () {
    var file = document.querySelector('#uploader').files[0];
    var uploadStatus = document.querySelector('#uploadStatus');

    // TODO: Use Dave's client api when it's finished.
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (function () {
      this.state.assets.push(JSON.parse(xhr.responseText));
      this.setState({uploadStatus: 'File "' + file.name + '" successfully uploaded!'});
    }).bind(this));
    xhr.addEventListener('error', (function () {
      this.setState({uploadStatus: 'Error uploading file: ' + getErrorMessage(xhr.status)});
    }).bind(this));

    xhr.open('PUT', '/v3/assets/' + dashboard.project.current.id + '/' + file.name, true);
    xhr.send(file);
    this.setState({uploadStatus: 'Uploading...'});
  },

  deleteAssetRow: function (name) {
    this.setState({
      assets: this.state.assets.filter(function (asset) {
        return asset.filename !== name;
      })
    });
    this.setState({uploadStatus: 'File "' + name + '" successfully deleted!'});
  },

  render: function() {
    var assetList;
    if (this.state.assets === null) {
      assetList = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
        </div>
      )
    } else if (this.state.assets.length === 0) {
      assetList = (
        <div style={{margin: '1em 0'}}>
          Your assets will appear here.  Click "Upload File" to add a new asset for this project.
        </div>
      );
    } else {
      assetList = (
        <div style={{maxHeight: '330px', overflow: 'scroll', margin: '1em 0'}}>
          <table style={{width: '100%'}}>
            <tbody>
          {this.state.assets.map(function (asset) {
            return <AssetRow key={asset.filename} name={asset.filename} type={asset.category}
                delete={this.deleteAssetRow.bind(this, asset.filename)}
                choose={this.props.assetChosen.bind(this, asset.filename)}/>;
          }.bind(this))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="modal-content" style={{margin: 0}}>
        <p className="dialog-title">Manage Assets</p>
        {assetList}
        <input type="file" id="uploader" style={{display: 'none'}} onChange={this.upload}/>
        <button onClick={this.fileUploadClicked} className="share"><i className="fa fa-upload"></i> Upload File</button>
        <span id="uploadStatus" style={{margin: '0 10px'}}>{this.state.uploadStatus}</span>
      </div>
    );
  }
});
