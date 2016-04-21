/* global dashboard */

var assetsApi = require('@cdo/apps/clientApi').assets;
var assetListStore = require('../assets/assetListStore');

var styles = {
  button: {
    float: 'left',
    marginRight: '5px'
  },
  attachment: {
    background: '#08c',
    color: '#fff',
    borderRadius: '4px',
    padding: '0 5px',
    margin: '4px 4px 4px 0',
    float: 'left',
    fontSize: '0.8em'
  }
};

/**
 * An attachment list component.
 */
var Attachments = React.createClass({
  propTypes: {},

  getInitialState: function () {
    return {loaded: false};
  },

  componentWillMount: function () {
    assetsApi.ajax('GET', '', this.onAssetListReceived);
  },

  onAssetListReceived: function (xhr) {
    assetListStore.reset(JSON.parse(xhr.responseText));
    if (this.isMounted()) {
      this.setState({loaded: true});
    }
  },

  render: function () {
    var attachmentList = <span style={{fontSize: '0.8em'}}>Loading...</span>;
    if (this.state.loaded) {
      attachmentList = assetListStore.list().map(function (asset) {
        var url = '/v3/assets/' + dashboard.project.getCurrentId() + '/' + asset.filename;
        return <a style={styles.attachment} href={url}>{asset.filename}</a>;
      });
    }

    return (
      <div>
        <input style={styles.button} className='btn btn-default' type='button' value='Add/Remove Attachments'/>
        {attachmentList}
      </div>
    );
  }
});
module.exports = Attachments;

window.dashboard = window.dashboard || {};
window.dashboard.Attachments = Attachments;
