import React, {PropTypes} from 'react';

function downloadRemoteUrl(url, downloadName) {
  fetch(url, {
    method: 'GET',
  })
    .then(response => response.blob())
    .then(blob => {
      const element = document.createElement('a');
      const url = URL.createObjectURL(blob);
      element.setAttribute('href', url);
      element.setAttribute('download', downloadName);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    })
    .catch(error => {
      console.log(error);
    });
}

const DOWNLOAD_NAME = 'myvideo.mp4';

export default class DownloadReplayVideoButton extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
  };

  state = {
    videoExists: false,
  };

  getVideoUrl = () =>
    `https://dance-api.code.org/videos/video-${this.props.channelId}.mp4`;

  downloadVideo = (event) => {
    if (this.state.videoExists) {
      downloadRemoteUrl(this.getVideoUrl(), DOWNLOAD_NAME);
    } else {
      this.checkVideo();
    }

    event.preventDefault();
    return false;
  };

  checkVideo = (onSuccess = () => {}, onError = () => {}) => {
    fetch(this.getVideoUrl(), {
      method: 'HEAD',
    })
      .then(response => {
        this.setState({
          videoExists: true,
        });
        onSuccess(response);
      })
      .catch(error => {
        this.setState({
          videoExists: false,
        });
        onError(error);
      });
  };

  render() {
    return (
      <a
        className="download-replay-video-button"
        href=""
        disabled={!this.state.videoExists}
        onClick={this.downloadVideo}
      >
        <i className="fa fa-film" style={{fontSize: 28}} />
        <span>Get Ma Video</span>
      </a>
    );
  }
}
