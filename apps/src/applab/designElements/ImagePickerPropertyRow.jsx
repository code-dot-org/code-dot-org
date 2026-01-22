import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import FlaggedImageModal from '@cdo/apps/sharedComponents/FlaggedImageModal';
import HttpClient from '@cdo/apps/util/HttpClient';
import commonMsg from '@cdo/locale';

import {getStore} from '../../redux';

import * as rowStyle from './rowStyle';

// We'd prefer not to make GET requests every time someone types a character.
// This is the amount of time that must pass between edits before we'll do a GET
// I expect that the vast majority of time, people will be copy/pasting URLs
// instead of typing them manually, which will result in an immediate GET,
// unless they pasted within USER_INPUT_DELAY ms of editing the field manually
const USER_INPUT_DELAY = 1500;

export default class ImagePickerPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
    elementId: PropTypes.string,
    currentImageType: PropTypes.string,
  };

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  state = {
    value: this.props.initialValue,
    lastEdit: 0,
    showFlaggedModal: false,
    pendingUrl: null,
    flaggedModalError: null,
    moderating: false,
  };

  changeUnlessEditing(filename) {
    if (Date.now() - this.state.lastEdit >= USER_INPUT_DELAY) {
      this.changeImage(filename);
    }
  }

  handleChangeInternal = event => {
    const filename = event.target.value;
    this.changeUnlessEditing(filename);

    this.setState({
      value: filename,
      lastEdit: Date.now(),
    });

    // We may not have changed file yet (if we still actively editing)
    setTimeout(
      function () {
        this.changeUnlessEditing(this.state.value);
      }.bind(this),
      USER_INPUT_DELAY
    );
  };

  handleButtonClick = () => {
    // TODO: This isn't the pure-React way of referencing the AssetManager
    // component. Ideally we'd be able to `require` it directly without needing
    // to know about `designMode`.
    //
    // However today the `createModalDialog` function and `Dialog` component
    // are intertwined with `StudioApp` which is why we have this direct call.
    dashboard.assets.showAssetManager(this.changeImage, 'image', null, {
      showUnderageWarning: !getStore().getState().pageConstants.is13Plus,
      elementId: this.props.elementId,
      currentValue: this.state.value,
      currentImageType: this.props.currentImageType,
    });
  };

  changeImage = (filename, timestamp) => {
    // Check if this is an absolute URL pointing to an image
    if (ABSOLUTE_REGEXP.test(filename) && this.isImageUrl(filename)) {
      // Moderate the image URL first
      this.setState({moderating: true, pendingUrl: filename});
      this.moderateImageUrl(filename, timestamp);
    } else {
      // Not an image URL, proceed without moderation
      this.applyImageChange(filename, timestamp);
    }
  };

  isImageUrl = url => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const urlLower = url.toLowerCase();
    return imageExtensions.some(ext => urlLower.includes(ext));
  };

  moderateImageUrl = (url, timestamp) => {
    const body = JSON.stringify({url: url});

    HttpClient.post(`/v3/images/moderate-url`, body, true, {
      'Content-Type': 'application/json; charset=UTF-8',
    })
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          // Server-side error (invalid URL, fetch failed, etc)
          MetricsReporter.logError(
            'Image moderation error for URL: ' + json.error
          );
          // Proceed with URL anyway
          this.applyImageChange(url, timestamp);
          return;
        }

        if (json.rating !== 'everyone' && json.rating !== 'unknown') {
          // Image is flagged
          this.setState({
            showFlaggedModal: true,
            moderating: false,
          });
          analyticsReporter.sendEvent(
            EVENTS.FLAGGED_CUSTOM_IMAGE,
            {
              UploaderType: 'Image Picker Property Row',
              ProjectType: 'applab',
            },
            PLATFORMS.STATSIG
          );
        } else {
          // Image is clean
          this.applyImageChange(url, timestamp);
        }
      })
      .catch(err => {
        MetricsReporter.logError('Image moderation error for URL: ' + err);
        // If moderation fails, proceed with URL anyway
        this.applyImageChange(url, timestamp);
      });
  };

  applyImageChange = (filename, timestamp) => {
    this.props.handleChange(filename, timestamp);
    // Because we delay the call to this function via setTimeout, we must be sure not
    // to call setState after the component is unmounted, or React will warn and
    // tests will fail.
    if (this.isMounted_) {
      this.setState({
        value: filename,
        moderating: false,
        pendingUrl: null,
      });
    }
  };

  handleAcceptFlaggedImage = () => {
    const {pendingUrl} = this.state;
    const projectId = getStore().getState().pageConstants?.channelId;

    if (!pendingUrl || !projectId) return;

    const body = JSON.stringify({type: 'flag'});
    HttpClient.post(`/v3/channels/${projectId}/abuse/image`, body, true, {
      'Content-Type': 'application/json; charset=UTF-8',
    })
      .then(response => response.json())
      .then(() => {
        this.applyImageChange(pendingUrl);
        analyticsReporter.sendEvent(
          EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
          {
            UploaderType: 'Image Picker Property Row',
            ProjectType: 'applab',
          },
          PLATFORMS.STATSIG
        );
        this.setState({
          showFlaggedModal: false,
          flaggedModalError: null,
        });
      })
      .catch(err => {
        this.setState({
          showFlaggedModal: true,
          flaggedModalError: 'Error flagging project: ' + err.message,
        });
        MetricsReporter.logError('Update project abuse error: ' + err);
      });
  };

  handleCancelFlaggedImage = () => {
    this.setState({
      showFlaggedModal: false,
      pendingUrl: null,
      flaggedModalError: null,
      moderating: false,
      value: this.props.initialValue, // Reset to initial value
    });
    analyticsReporter.sendEvent(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'Image Picker Property Row',
        ProjectType: 'applab',
      },
      PLATFORMS.STATSIG
    );
  };

  render() {
    return (
      <>
        {this.state.showFlaggedModal && (
          <FlaggedImageModal
            onAccept={this.handleAcceptFlaggedImage}
            onCancel={this.handleCancelFlaggedImage}
            errorMessage={this.state.flaggedModalError}
          />
        )}
        <div style={rowStyle.container}>
          <div style={rowStyle.description}>{this.props.desc}</div>
          <div>
            <input
              className="imagePickerInput"
              value={this.state.value}
              onChange={this.handleChangeInternal}
              style={rowStyle.input}
              disabled={this.state.moderating}
            />
            &nbsp;
            <a style={rowStyle.link} onClick={this.handleButtonClick}>
              {commonMsg.choosePrefix()}
            </a>
            {this.state.moderating && (
              <div style={{color: '#999', fontStyle: 'italic', marginTop: 5}}>
                Checking image...
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
