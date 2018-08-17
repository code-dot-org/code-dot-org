import React, {PropTypes} from 'react';
import Radium from 'radium';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';
import color from "@cdo/apps/util/color";

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
  };

  constructor(props) {
    super(props);
    this.state = {
      isPlayingAudio: false
    };
    let api = this.props.useFilesApi ? filesApi : assetsApi;
    if (this.props.projectId) {
      api = api.withProjectId(this.props.projectId);
    }
    const basePath = api.basePath(this.props.name);
    let cacheBustSuffix = '';
    if (this.props.timestamp) {
      const date = new Date(this.props.timestamp);
      cacheBustSuffix = `?t=${date.valueOf()}`;
    }
    this.srcPath = `${basePath}${cacheBustSuffix}`;

    if (this.props.type === 'audio') {
      this.props.soundPlayer.register({id: this.srcPath, mp3: this.srcPath});
    }
  }

  clickSoundControl = () => {
    if (this.state.isPlayingAudio) {
      this.setState({isPlayingAudio: false});
      this.props.soundPlayer.stopPlayingURL(this.srcPath);
    } else {
      this.setState({isPlayingAudio: true});
      this.props.soundPlayer.play(this.srcPath, {onEnded: ()=>{this.setState({isPlayingAudio: false});}});
    }
  };

  render() {
    const {
      type,
      iconStyle,
      style,
      src
    } = this.props;

    const playIcon = this.state.isPlayingAudio ? 'fa-pause-circle' : 'fa-play-circle';

    return (
      <div>
        {type === 'audio' ?
          <div style={[styles.wrapper, styles.audioWrapper]}>
            <i onClick={this.clickSoundControl} className={'fa '+ playIcon +' fa-4x'} style={styles.audioIcon} />
          </div> :
          <div className="assetThumbnail" style={[styles.wrapper, style, styles.background]}>
            {type === 'image' ?
              <a
                href={src}
                target="_blank"
              >
                <img src={this.srcPath} style={assetThumbnailStyle}/>
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
