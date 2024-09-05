import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

// Record events to Firehose to understand how often users:
//   - see the download button,
//   - click it,
//   - actually get a download started,
//   - successfully get a file and trigger the client download,
//   - have the download fail,
//   - have the download attempts timeout.

const FIREHOSE_STUDY = 'finish_dialog';
const FIREHOSE_STUDY_GROUP = 'replay_video';
const FIREHOSE_EVENT_DOWNLOAD_BUTTON_SEEN = 'download_button_seen';
const FIREHOSE_EVENT_DOWNLOAD_CLICKED = 'download_clicked';
const FIREHOSE_EVENT_DOWNLOAD_STARTED = 'download_started';
const FIREHOSE_EVENT_DOWNLOAD_SUCCEEDED = 'download_succeeded';
const FIREHOSE_EVENT_DOWNLOAD_FAILED = 'download_failed';
const FIREHOSE_EVENT_DOWNLOAD_FAILED_TIMEOUT = 'download_failed_timeout';

/**
 * Trigger a download from the given url with the given name.
 *
 * Necessary to create a hidden anchor element and trigger a click in order to
 * apply downloadName, as the download attribute only works for same-origin
 * URLs.
 */
function downloadRemoteUrl(url, downloadName) {
  firehoseClient.putRecord({
    study: FIREHOSE_STUDY,
    study_group: FIREHOSE_STUDY_GROUP,
    event: FIREHOSE_EVENT_DOWNLOAD_STARTED,
  });

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

      firehoseClient.putRecord({
        study: FIREHOSE_STUDY,
        study_group: FIREHOSE_STUDY_GROUP,
        event: FIREHOSE_EVENT_DOWNLOAD_SUCCEEDED,
      });
    })
    .catch(error => {
      console.log(error);

      firehoseClient.putRecord({
        study: FIREHOSE_STUDY,
        study_group: FIREHOSE_STUDY_GROUP,
        event: FIREHOSE_EVENT_DOWNLOAD_FAILED,
      });
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
    style: PropTypes.object,
  };

  state = {
    videoExists: false,
    downloadInitiated: false,
    checkVideoAttempts: 0,
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

    if (this.shouldRenderButton()) {
      firehoseClient.putRecord({
        study: FIREHOSE_STUDY,
        study_group: FIREHOSE_STUDY_GROUP,
        event: FIREHOSE_EVENT_DOWNLOAD_BUTTON_SEEN,
      });
    }
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
        body: JSON.stringify(this.props.replayLog),
      });
    }
  };

  getVideoUrl = () =>
    `https://dance-api.code.org/videos/video-${this.props.channelId}.mp4`;

  // Show the button as enabled if we know the video exists; also show it as
  // enabled on initial load, until the first time the user clicks it
  buttonEnabled = () => this.state.videoExists || !this.state.downloadInitiated;

  clickDownloadVideo = event => {
    firehoseClient.putRecord({
      study: FIREHOSE_STUDY,
      study_group: FIREHOSE_STUDY_GROUP,
      event: FIREHOSE_EVENT_DOWNLOAD_CLICKED,
    });

    this.tryDownloadVideo(event);
  };

  tryDownloadVideo = event => {
    if (!this.state.downloadInitiated) {
      this.setState({
        downloadInitiated: true,
      });
    }

    if (this.state.videoExists) {
      downloadRemoteUrl(this.getVideoUrl(), DOWNLOAD_NAME);
      this.setState({
        downloadInitiated: false,
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
      method: 'HEAD',
    }).then(response => {
      this.setState({
        videoExists: response.ok,
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
        checkVideoAttempts: 0,
      });

      if (this.props.onError) {
        this.props.onError();
      }

      firehoseClient.putRecord({
        study: FIREHOSE_STUDY,
        study_group: FIREHOSE_STUDY_GROUP,
        event: FIREHOSE_EVENT_DOWNLOAD_FAILED_TIMEOUT,
      });

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
        checkVideoAttempts: attempts,
      });
    });
  };

  shouldRenderButton() {
    // this is temporarily disabled until we decide for sure that we want to remove
    // it entirely or re-enable it after making sure it's working properly.
    return false;
    // return this.props.channelId && this.hasReplayVideo();
  }

  render() {
    if (!this.shouldRenderButton()) {
      return null;
    }

    let icon = 'fa-download';
    if (this.state.downloadInitiated) {
      icon = 'fa-spinner fa-pulse';
    }

    const style = Object.assign({}, this.props.style);

    return (
      <Button
        color={Button.ButtonColor.neutralDark}
        type="button"
        className="download-replay-video-button"
        style={style}
        disabled={!this.buttonEnabled()}
        onClick={this.clickDownloadVideo}
      >
        <i className={`fa ${icon}`} style={styles.icon} />
        <span style={styles.span}>
          {i18n.downloadReplayVideoButtonDownload()}
        </span>
      </Button>
    );
  }
}

const styles = {
  icon: {
    fontSize: 17,
  },
  span: {
    paddingLeft: 10,
  },
};

export const UnconnectedDownloadReplayVideoButton = DownloadReplayVideoButton;

export default connect(state => ({
  appType: state.pageConstants?.appType,
  channelId: state.pageConstants?.channelId,
  replayLog: state.shareDialog.replayLog,
}))(DownloadReplayVideoButton);
