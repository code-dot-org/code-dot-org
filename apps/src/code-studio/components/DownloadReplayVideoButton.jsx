import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';

import color from '../../util/color';

/**
 * Trigger a download from the given url with the given name.
 *
 * Necessary to create a hidden anchor element and trigger a click in order to
 * apply downloadName, as the download attribute only works for same-origin
 * URLs.
 */
function downloadRemoteUrl(url, downloadName) {
  fetch(url, {
    method: 'GET'
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
const MAX_ATTEMPTS = 30; // we want to fail after ~30 seconds, so 30 attempts at 1 attempt / second

/**
 * A button to download a video generated from a replay log. This component
 * will, if given the appropriate parameters, also take care of uploading the
 * replay log and initiating the generation of said video.
 */
class DownloadReplayVideoButton extends React.Component {
  static propTypes = {
    appType: PropTypes.string,
    channelId: PropTypes.string,
    onError: PropTypes.func,
    replayLog: PropTypes.array,
    style: PropTypes.object
  };

  state = {
    videoExists: false,
    downloadInitiated: false,
    checkVideoAttempts: 0
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
    this.tryCreateReplayVideo();
    this.checkVideoUntilSuccess();
  }

  componentWillUnmount() {
    clearTimeout(this.checkVideoUntilSuccessTimeout);
  }

  getUploadUrl = () =>
    window && window.appOptions && window.appOptions.signedReplayLogUrl;

  hasReplayVideo = () => this.props.appType === 'dance' && this.getUploadUrl();

  shouldCreateReplayVideo = () =>
    this.hasReplayVideo() &&
    this.props.replayLog &&
    this.props.replayLog.length > 1;

  tryCreateReplayVideo = () => {
    if (this.shouldCreateReplayVideo()) {
      fetch(this.getUploadUrl(), {
        method: 'PUT',
        body: JSON.stringify(this.props.replayLog)
      });
    }
  };

  getVideoUrl = () =>
    `https://dance-api.code.org/videos/video-${this.props.channelId}.mp4`;

  // Show the button as enabled if we know the video exists; also show it as
  // enabled on initial load, until the first time the user clicks it
  buttonEnabled = () => this.state.videoExists || !this.state.downloadInitiated;

  tryDownloadVideo = event => {
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

    if (event) {
      event.preventDefault();
    }
    return false;
  };

  checkVideo() {
    return fetch(this.getVideoUrl(), {
      method: 'HEAD'
    }).then(response => {
      this.setState({
        videoExists: response.ok
      });

      return response;
    });
  }

  checkVideoUntilSuccess = (delay = 1000) => {
    if (!this.hasReplayVideo()) {
      return;
    }

    if (this.state.videoExists) {
      return;
    }

    if (this.checkVideoUntilSuccessTimeout) {
      clearTimeout(this.checkVideoUntilSuccessTimeout);
    }

    if (this.state.checkVideoAttempts >= MAX_ATTEMPTS) {
      this.setState({
        checkVideoAttempts: 0
      });

      if (this.props.onError) {
        this.props.onError();
      }

      return;
    }

    this.checkVideo().then(response => {
      this.checkVideoUntilSuccessTimeout = null;
      let attempts = this.state.checkVideoAttempts;

      if (!response.ok) {
        this.checkVideoUntilSuccessTimeout = setTimeout(
          this.checkVideoUntilSuccess,
          delay
        );
        attempts += 1;
      }

      this.setState({
        checkVideoAttempts: attempts
      });
    });
  };

  render() {
    if (!this.props.channelId || !this.hasReplayVideo()) {
      return null;
    }

    let icon = 'fa-download';
    if (this.state.downloadInitiated) {
      icon = 'fa-spinner fa-pulse';
    }

    const style = Object.assign({}, this.props.style);
    if (!this.buttonEnabled()) {
      Object.assign(style, styles.disabledLink);
    }

    return (
      <button
        type="button"
        className="download-replay-video-button"
        style={style}
        disabled={!this.buttonEnabled()}
        onClick={this.tryDownloadVideo}
      >
        <i className={`fa ${icon}`} style={styles.icon} />
        <span style={styles.span}>
          {i18n.downloadReplayVideoButtonDownload()}
        </span>
      </button>
    );
  }
}

const styles = {
  disabledLink: {
    backgroundColor: color.lighter_gray,
    borderColor: color.lighter_gray,
    boxShadow: 'none'
  },
  icon: {
    fontSize: 17
  },
  span: {
    paddingLeft: 10
  }
};

export const UnconnectedDownloadReplayVideoButton = DownloadReplayVideoButton;

export default connect(state => ({
  appType: state.pageConstants.appType,
  channelId: state.pageConstants.channelId,
  replayLog: state.shareDialog.replayLog
}))(DownloadReplayVideoButton);
