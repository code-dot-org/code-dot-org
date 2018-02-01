import React, {PropTypes} from 'react';
import Radium from 'radium';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';

const defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  pdf: 'fa fa-file-pdf-o',
  doc: 'fa fa-file-text-o',
  unknown: 'fa fa-question'
};

const assetThumbnailStyle = {
  width: 'auto',
  maxWidth: '100%',
  height: 'auto',
  maxHeight: '100%',
  marginTop: '50%',
  transform: 'translateY(-50%)',
  msTransform: 'translateY(-50%)',
  WebkitTransform: 'translateY(-50%)'
};

const assetIconStyle = {
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

class AssetThumbnail extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    style: PropTypes.object,
    iconStyle: PropTypes.object,
    useFilesApi: PropTypes.bool,
    projectId: PropTypes.string
  };

  render() {
    const {type, name} = this.props;
    let api = this.props.useFilesApi ? filesApi : assetsApi;
    if (this.props.projectId){
      api = api.withProjectId(this.props.projectId);
    }

    return (
      <div className="assetThumbnail" style={[styles.wrapper, this.props.style]}>
        {type === 'image' ?
         <img src={api.basePath(name)} style={assetThumbnailStyle} /> :
         <i
           className={defaultIcons[type] || defaultIcons.unknown}
           style={[assetIconStyle, this.props.iconStyle]}
         />
        }
      </div>
    );
  }
}

export default Radium(AssetThumbnail);
