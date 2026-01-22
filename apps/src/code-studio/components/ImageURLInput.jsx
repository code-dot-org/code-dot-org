import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import FlaggedImageModal from '@cdo/apps/sharedComponents/FlaggedImageModal';
import InputPrompt from '@cdo/apps/templates/InputPrompt';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string,
    projectId: PropTypes.string,
    projectType: PropTypes.string,
  };
  state = {
    showError: false,
    showFlaggedModal: false,
    pendingUrl: null,
    flaggedModalError: null,
    moderating: false,
  };

  handleSubmitWrapper = url => {
    if (!ABSOLUTE_REGEXP.test(url)) {
      this.setState({showError: true});
      return;
    }

    // Check if URL points to an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const urlLower = url.toLowerCase();
    const isImageUrl = imageExtensions.some(ext => urlLower.includes(ext));

    if (!isImageUrl) {
      // Not an image URL, proceed without moderation
      this.props.assetChosen(url, moment());
      analyticsReporter.sendEvent(
        EVENTS.SUBMIT_IMAGE_URL,
        {LabType: 'applab'},
        PLATFORMS.STATSIG
      );
      return;
    }

    // For images, attempt to moderate
    this.setState({moderating: true, pendingUrl: url});
    this.moderateImageUrl(url);
  };

  moderateImageUrl = url => {
    // Use server-side moderation endpoint to avoid CORS issues
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
          this.acceptUrl();
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
              UploaderType: 'Image URL Input',
              ProjectType: this.props.projectType,
            },
            PLATFORMS.STATSIG
          );
        } else {
          // Image is clean or couldn't be moderated
          this.acceptUrl();
        }
      })
      .catch(err => {
        MetricsReporter.logError('Image moderation error for URL: ' + err);
        // If moderation fails, proceed with URL anyway
        this.acceptUrl();
      });
  };

  acceptUrl = () => {
    const {pendingUrl} = this.state;
    if (pendingUrl) {
      this.props.assetChosen(pendingUrl, moment());
      analyticsReporter.sendEvent(
        EVENTS.SUBMIT_IMAGE_URL,
        {LabType: 'applab'},
        PLATFORMS.STATSIG
      );
      this.setState({
        moderating: false,
        pendingUrl: null,
      });
    }
  };

  handleAcceptFlaggedImage = () => {
    const {pendingUrl} = this.state;
    if (!pendingUrl || !this.props.projectId) return;

    const body = JSON.stringify({type: 'flag'});
    HttpClient.post(
      `/v3/channels/${this.props.projectId}/abuse/image`,
      body,
      true,
      {'Content-Type': 'application/json; charset=UTF-8'}
    )
      .then(response => response.json())
      .then(() => {
        this.props.assetChosen(pendingUrl, moment());
        analyticsReporter.sendEvent(
          EVENTS.SUBMIT_IMAGE_URL,
          {LabType: 'applab'},
          PLATFORMS.STATSIG
        );
        analyticsReporter.sendEvent(
          EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
          {
            UploaderType: 'Image URL Input',
            ProjectType: this.props.projectType,
          },
          PLATFORMS.STATSIG
        );
        this.setState({
          showFlaggedModal: false,
          pendingUrl: null,
          moderating: false,
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
    });
    analyticsReporter.sendEvent(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'Image URL Input',
        ProjectType: this.props.projectType,
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
        <div>
          <div style={styles.supportingText}>
            {i18n.imageURLInputDescription()}
          </div>
          <InputPrompt
            question={i18n.imageURLInputPrompt()}
            onInputReceived={this.handleSubmitWrapper}
            currentValue={this.props.currentValue}
            disabled={this.state.moderating}
          />
          {this.state.moderating && (
            <div style={styles.moderating}>Checking image...</div>
          )}
          {this.state.showError && (
            <div style={styles.error}>{i18n.imageURLInputInvalid()}</div>
          )}
          <div style={styles.example}>{i18n.imageURLInputExample()}</div>
        </div>
      </>
    );
  }
}

const styles = {
  supportingText: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px',
  },
  example: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px',
  },
  error: {
    color: 'red',
  },
  moderating: {
    color: '#999',
    fontStyle: 'italic',
    margin: '0.5em 0',
  },
};
