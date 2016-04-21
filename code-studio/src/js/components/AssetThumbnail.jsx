var assetsApi = require('@cdo/apps/clientApi').assets;

var defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  pdf: 'fa fa-file-pdf-o',
  unknown: 'fa fa-question'
};

var assetThumbnailStyle = {
  width: 'auto',
  maxWidth: '100%',
  height: 'auto',
  maxHeight: '100%',
  marginTop: '50%',
  transform: 'translateY(-50%)',
  msTransform: 'translateY(-50%)',
  WebkitTransform: 'translateY(-50%)'
};

var assetIconStyle = {
  margin: '15px 0',
  fontSize: '32px'
};

var AssetThumbnail = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'audio', 'video', 'pdf']).isRequired
  },

  render: function () {
    var type = this.props.type;
    var name = this.props.name;

    return (
      <td width="80">
        <div className="assetThumbnail" style={{
          width: '60px',
          height: '60px',
          margin: '10px auto',
          background: '#eee',
          border: '1px solid #ccc',
          textAlign: 'center'
        }}>
          {type === 'image' ?
             <img src={assetsApi.basePath(name)} style={assetThumbnailStyle} /> :
             <i className={defaultIcons[type] || defaultIcons.unknown} style={assetIconStyle} />
           }
        </div>
      </td>
    );
  }
});
module.exports = AssetThumbnail;
