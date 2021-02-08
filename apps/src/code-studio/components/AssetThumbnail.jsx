import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import {assets as assetsApi} from '@cdo/apps/clientApi';

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
    api: PropTypes.object,
    projectId: PropTypes.string,
    levelName: PropTypes.string,
    soundPlayer: PropTypes.object
  };

  constructor(props) {
    super(props);
    let api = this.props.api || assetsApi; // Fallback to assetsApi.
    if (this.props.levelName) {
      api = api.withLevelName(this.props.levelName);
    } else if (this.props.projectId) {
      api = api.withProjectId(this.props.projectId);
    }
    const basePath = api.basePath(this.props.name);
    let cacheBustSuffix = '';
    if (this.props.timestamp) {
      const date = new Date(this.props.timestamp);
      cacheBustSuffix = `?t=${date.valueOf()}`;
    }

    this.srcPath = `${basePath}${cacheBustSuffix}`;

    if (this.props.type === 'audio' && this.props.soundPlayer) {
      this.props.soundPlayer.register({id: this.srcPath, mp3: this.srcPath});
    }
    this.state = {
      isPlayingAudio: false
    };
  }

  clickSoundControl = () => {
    if (this.state.isPlayingAudio && this.props.soundPlayer) {
      this.setState({isPlayingAudio: false});
      this.props.soundPlayer.stopPlayingURL(this.srcPath);
    } else if (this.props.soundPlayer) {
      this.setState({isPlayingAudio: true});
      this.props.soundPlayer.play(this.srcPath, {
        onEnded: () => {
          this.setState({isPlayingAudio: false});
        }
      });
    }
  };

  render() {
    const {type, iconStyle, style} = this.props;

    return (
      <div className="assetThumbnail">
        {type === 'audio' ? (
          <AudioThumbnail
            clickSoundControl={this.clickSoundControl}
            isPlaying={this.state.isPlayingAudio}
          />
        ) : (
          <div style={[styles.wrapper, style, styles.background]}>
            {type === 'image' ? (
              <ImageThumbnail src={this.srcPath} />
            ) : (
              <DefaultThumbnail type={type} iconStyle={iconStyle} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Radium(AssetThumbnail);

const AudioThumbnail = Radium(
  class extends React.Component {
    static propTypes = {
      clickSoundControl: PropTypes.func,
      isPlaying: PropTypes.bool
    };

    render() {
      const playIcon = this.props.isPlaying
        ? 'fa-pause-circle'
        : 'fa-play-circle';

      return (
        <div style={[styles.wrapper, styles.audioWrapper]}>
          <i
            onClick={this.props.clickSoundControl}
            className={'fa ' + playIcon + ' fa-4x'}
            style={styles.audioIcon}
          />
        </div>
      );
    }
  }
);

const ImageThumbnail = Radium(
  class extends React.Component {
    static propTypes = {
      src: PropTypes.string
    };

    render() {
      return (
        <a href={this.props.src} target="_blank" rel="noopener noreferrer">
          <img
            src={this.props.src}
            style={assetThumbnailStyle}
            id="ui-image-thumbnail"
          />
        </a>
      );
    }
  }
);

const DefaultThumbnail = Radium(
  class extends React.Component {
    static propTypes = {
      type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc'])
        .isRequired,
      iconStyle: PropTypes.object
    };

    render() {
      return (
        <i
          className={defaultIcons[this.props.type] || defaultIcons.unknown}
          style={[assetIconStyle, this.props.iconStyle]}
        />
      );
    }
  }
);
