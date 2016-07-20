import React from 'react';
import Radium from 'radium';
import {assets as assetsApi} from '@cdo/apps/clientApi';

var defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  pdf: 'fa fa-file-pdf-o',
  doc: 'fa fa-file-text-o',
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

export const styles = {
  wrapper: {
    width: 60,
    height: 60,
    margin: '10px auto',
    background: '#eee',
    border: '1px solid #ccc',
    textAlign: 'center'
  },
};

var AssetThumbnail = Radium(React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    style: React.PropTypes.object,
    iconStyle: React.PropTypes.object,
  },

  render: function () {
    var type = this.props.type;
    var name = this.props.name;

    return (
      <div className="assetThumbnail" style={[styles.wrapper, this.props.style]}>
        {type === 'image' ?
         <img src={assetsApi.basePath(name)} style={assetThumbnailStyle} /> :
         <i className={defaultIcons[type] || defaultIcons.unknown}
            style={[assetIconStyle, this.props.iconStyle]} />
        }
      </div>
    );
  }
}));
export default AssetThumbnail;
