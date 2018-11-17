import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';

import color from "../../util/color";

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

const DOWNLOAD_NAME = 'dance_party.mp4';

const styles = {
  disabledLink: {
    backgroundColor: color.lighter_gray,
    boxShadow: 'none',
  },
  icon: {
    fontSize: 28
  }
};

export default class DownloadReplayVideoButton extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
  };

  state = {
    videoExists: false,
    downloadInitiated: false,
    checkVideoUntilSuccessTimeout: null
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    // if the download has been initiated and we are updating from the video
    // not existing to the video existing, trigger the actual download
    if (
      this.state.downloadInitiated &&
      this.state.videoExists &&
      !prevState.videoExists
    ) {
      this.tryDownloadVideo();
    }
  }

  componentDidMount() {
    this.checkVideoUntilSuccess();
  }

  getVideoUrl = () =>
    `https://dance-api.code.org/videos/video-${this.props.channelId}.mp4`;

  // Show the button as enabled if we know the video exists; also show it as
  // enabled on initial load, until the first time the user clicks it
  buttonEnabled = () => this.state.videoExists || !this.state.downloadInitiated;

  tryDownloadVideo = (event = {}) => {
    if (!this.state.downloadInitiated) {
      this.setState({
        downloadInitiated: true
      });
    }

    if (this.state.videoExists) {
      downloadRemoteUrl(this.getVideoUrl(), DOWNLOAD_NAME);
      this.setState({
        downloadInitiated: false
      });
    } else {
      this.checkVideo();
    }

    event.preventDefault();
    return false;
  };

  checkVideo = () => {
    return fetch(this.getVideoUrl(), {
      method: 'HEAD',
    }).then((response) => {
      this.setState({
        videoExists: response.ok,
      });

      return response;
    });
  };

  checkVideoUntilSuccess = (delay = 1000) => {
    if (this.state.videoExists) {
      return;
    }

    if (this.state.checkVideoUntilSuccessTimeout) {
      clearTimeout(this.state.checkVideoUntilSuccessTimeout);
    }

    this.checkVideo().then((response) => {
      let timeout = null;
      if (!response.ok) {
        timeout = setTimeout(this.checkVideoUntilSuccess, delay);
      }

      this.setState({
        checkVideoUntilSuccessTimeout: timeout
      });
    });
  };

  render() {
    let icon = "fa-download";
    if (this.state.downloadInitiated) {
      icon = "fa-spinner fa-pulse";
    }

    return (
      <a
        className="download-replay-video-button"
        href="#"
        style={this.buttonEnabled() ? {} : styles.disabledLink}
        disabled={!this.buttonEnabled()}
        onClick={this.tryDownloadVideo}
      >
        <i
          className={`fa ${icon}`}
          style={styles.icon}
        />
        <span>{i18n.downloadReplayVideoButtonDownload()}</span>
      </a>
    );
  }
}
