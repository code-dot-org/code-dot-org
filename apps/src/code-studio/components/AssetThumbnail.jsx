import React, {PropTypes} from 'react';
import Radium from 'radium';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';
import color from "@cdo/apps/util/color";
import AudioIconPlayer from "./AudioIconPlayer";

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
    margin: '10px auto'
  },
  background: {
    background: '#eee',
    border: '1px solid #ccc',
    textAlign: 'center'
  },
  audioIcon: {
    color: color.purple,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block'
  },
  audioWrapper: {
    display: 'flex'
  }
};

class AssetThumbnail extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    style: PropTypes.object,
    iconStyle: PropTypes.object,
    useFilesApi: PropTypes.bool,
    projectId: PropTypes.string,
    src: PropTypes.string,
    soundPlayer: PropTypes.object,

    //Temp prop to hide/show updated styles for audio recording release
    useUpdatedStyles: PropTypes.bool
  };

  state = {
    isPlaying: false
  };

  clickSoundControl = (src) => {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
      console.log(src);
      this.props.soundPlayer.stopPlayingURL(src);
    } else {
      this.setState({isPlaying: true});
      this.props.soundPlayer.play(src, {onEnded: ()=>{this.setState({isPlaying:false});}});
    }
  };

  render() {
    const {
      timestamp,
      type,
      name,
      useFilesApi,
      projectId,
      iconStyle,
      style,
      useUpdatedStyles
    } = this.props;
    let api = useFilesApi ? filesApi : assetsApi;
    if (projectId) {
      api = api.withProjectId(projectId);
    }
    const basePath = api.basePath(name);
    let cacheBustSuffix = '';
    if (timestamp) {
      const date = new Date(timestamp);
      cacheBustSuffix = `?t=${date.valueOf()}`;
    }
    const srcPath = `${basePath}${cacheBustSuffix}`;

    if (type === 'audio') {
      this.props.soundPlayer.register({id: srcPath, mp3: srcPath});
    }

    return (
      <div>
        {(useUpdatedStyles && type === 'audio') ?
          <div style={[styles.wrapper, styles.audioWrapper]}>
            <AudioIconPlayer src={srcPath} soundPlayer={this.props.soundPlayer}/>
          </div> :
          <div className="assetThumbnail" style={[styles.wrapper, style, styles.background]}>
            {type === 'image' ?
              <a
                href={this.props.src}
                target="_blank"
              >
                <img src={srcPath} style={assetThumbnailStyle}/>
              </a> :
              <i
                className={defaultIcons[type] || defaultIcons.unknown}
                style={[assetIconStyle, iconStyle]}
              />
            }
          </div>
        }
      </div>
    );
  }
}

export default Radium(AssetThumbnail);
