var React = require('react');
var assetsApi = require('./clientApi')('assets');

var defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  unknown: 'fa fa-question'
};

/**
 * Creates a thumbnail (the image itself for images, or an icon representing the
 * filetype).
 * @param type {String} The asset type (e.g. 'audio').
 * @param name {String} The name of the asset.
 * @returns {XML}
 */
function getThumbnail(type, name) {
  switch (type) {
    case 'image':
      var src = assetsApi.basePath(name);
      var assetThumbnailStyle = {
        width: 'auto',
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '100%',
        zoom: 2,
        marginTop: '50%',
        transform: 'translateY(-50%)',
        msTransform: 'translateY(-50%)',
        WebkitTransform: 'translateY(-50%)'
      };
      return <img src={src} style={assetThumbnailStyle} />;
    default:
      var icon = defaultIcons[type] || defaultIcons.unknown;
      var assetIconStyle = {
        margin: '15px 0',
        fontSize: '32px'
      };
      return <i className={icon} style={assetIconStyle}></i>;
  }
}

/**
 * A single row in the AssetManager, describing one asset.
 */
module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'audio', 'video']).isRequired,
    size: React.PropTypes.number,
    onChoose: React.PropTypes.func,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      action: 'normal',
      actionText: ''
    };
  },

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete: function () {
    this.setState({action: 'confirming delete', actionText: ''});
  },

  /**
   * This user didn't want to delete this asset.
   */
  cancelDelete: function () {
    this.setState({action: 'normal', actionText: ''});
  },

  /**
   * Delete this asset and notify the parent to remove this row. If the delete
   * fails, flip back to 'confirming delete' and display a message.
   */
  handleDelete: function () {
    this.setState({action: 'deleting', actionText: ''});

    // TODO: Use Dave's client api when it's finished.
    assetsApi.ajax('DELETE', this.props.name, this.props.onDelete, function () {
      this.setState({action: 'confirming delete',
          actionText: 'Error deleting file.'});
    }.bind(this));
  },

  render: function () {
    var actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = <button onClick={this.props.onChoose}>Choose</button>;
    } else {
      var size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    switch (this.state.action) {
      case 'normal':
        var src = assetsApi.basePath(this.props.name);
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {flex}
            <a href={src}
                target="_blank"
                style={{backgroundColor: 'transparent'}}>
              <button><i className="fa fa-eye"></i></button>
            </a>
            <button className="btn-danger" onClick={this.confirmDelete}>
              <i className="fa fa-trash-o"></i>
            </button>
            {this.state.actionText}
          </td>
        );
        break;
      case 'confirming delete':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <button className="btn-danger" onClick={this.handleDelete}>
              Delete File
            </button>
            <button onClick={this.cancelDelete}>Cancel</button>
            {this.state.actionText}
          </td>
        );
        break;
      case 'deleting':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <i className="fa fa-spinner fa-spin" style={{
              fontSize: '32px',
              marginRight: '15px'
            }}></i>
          </td>
        );
        break;
    }

    return (
      <tr className="assetRow" onDoubleClick={this.props.onChoose}>
        <td width="80">
          <div className="assetThumbnail" style={{
            width: '60px',
            height: '60px',
            margin: '10px auto',
            background: '#eee',
            border: '1px solid #ccc',
            textAlign: 'center'
          }}>
            {getThumbnail(this.props.type, this.props.name)}
          </div>
        </td>
        <td>{this.props.name}</td>
        {actions}
      </tr>
    );
  }
});
