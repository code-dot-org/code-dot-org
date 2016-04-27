var assetsApi = require('@cdo/apps/clientApi').assets;
var AssetRow = require('./AssetRow');
var AssetUploader = require('./AssetUploader');
var assetListStore = require('../assets/assetListStore');

var errorMessages = {
  403: 'Quota exceeded. Please delete some files and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.',
  unknown: 'An unknown error occurred.'
};

var errorUploadDisabled = "This project has been reported for abusive content, " +
  "so uploading new assets is disabled.";

function getErrorMessage(status) {
  return errorMessages[status] || errorMessages.unknown;
}

/**
 * A component for managing hosted assets.
 */
var AssetManager = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func,
    allowedExtensions: React.PropTypes.string,
    channelId: React.PropTypes.string.isRequired,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {
      assets: null,
      statusMessage: this.props.uploadsEnabled ? '' : errorUploadDisabled
    };
  },

  componentWillMount: function () {
    assetsApi.ajax('GET', '', this.onAssetListReceived, this.onAssetListFailure);
  },

  /**
   * Called after the component mounts, when the server responds with the
   * current list of assets.
   * @param xhr
   */
  onAssetListReceived: function (xhr) {
    assetListStore.reset(JSON.parse(xhr.responseText));
    if (this.isMounted()) {
      this.setState({assets: assetListStore.list(this.props.allowedExtensions)});
    }
  },

  /**
   * Called after the component mounts, if the server responds with an error
   * when loading the current list of assets.
   * @param xhr
   */
  onAssetListFailure: function (xhr) {
    if (this.isMounted()) {
      this.setState({
        statusMessage: 'Error loading asset list: ' + getErrorMessage(xhr.status)
      });
    }
  },

  onUploadStart: function () {
    this.setState({statusMessage: 'Uploading...'});
  },

  onUploadDone: function (result) {
    assetListStore.add(result);
    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions),
      statusMessage: 'File "' + result.filename + '" successfully uploaded!'
    });
  },

  onUploadError: function (status) {
    this.setState({statusMessage: 'Error uploading file: ' +
      getErrorMessage(status)});
  },

  deleteAssetRow: function (name) {
    this.setState({
      assets: assetListStore.remove(name),
      statusMessage: 'File "' + name + '" successfully deleted!'
    });
  },

  render: function () {
    var uploadButton = <div>
      <AssetUploader
        uploadsEnabled={this.props.uploadsEnabled}
        allowedExtensions={this.props.allowedExtensions}
        channelId={this.props.channelId}
        onUploadStart={this.onUploadStart}
        onUploadDone={this.onUploadDone}
        onUploadError={this.onUploadError}/>
      <span style={{margin: '0 10px'}} id="manage-asset-status">
        {this.state.statusMessage}
      </span>
    </div>;

    var assetList;
    // If `this.state.assets` is null, the asset list is still loading. If it's
    // empty, the asset list has loaded and there are no assets in the current
    // channel (matching the `allowedExtensions`, if any were provided).
    if (this.state.assets === null) {
      assetList = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
        </div>
      );
    } else if (this.state.assets.length === 0) {
      assetList = (
        <div>
          <div style={{margin: '1em 0'}}>
            Your assets will appear here. Click "Upload File" to add a new asset
            for this project.
          </div>
          {uploadButton}
        </div>
      );
    } else {
      var rows = this.state.assets.map(function (asset) {
        var choose = this.props.assetChosen && this.props.assetChosen.bind(this,
            asset.filename);

        return <AssetRow
            key={asset.filename}
            name={asset.filename}
            type={asset.category}
            size={asset.size}
            onChoose={choose}
            onDelete={this.deleteAssetRow.bind(this, asset.filename)} />;
      }.bind(this));

      assetList = (
        <div>
          <div style={{maxHeight: '330px', overflowY: 'scroll', margin: '1em 0'}}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
              </tbody>
            </table>
          </div>
          {uploadButton}
        </div>
      );
    }

    return assetList;
  }
});
module.exports = AssetManager;
