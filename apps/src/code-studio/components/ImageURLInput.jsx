import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';
import i18n from '@cdo/locale';

const HTTP_PREFIX_REGEX = /^http:\/\//i;
const FLAGGED_IMAGE_URL_ERROR =
  'This image URL cannot be used because it may contain inappropriate content.';
const MODERATION_ERROR =
  "We couldn't check this image link right now. Please try a different image link or upload a file.";

export default class ImageURLInput extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    allowedExtensions: PropTypes.string,
    currentValue: PropTypes.string,
  };
  state = {
    errorType: null,
    isSubmitting: false,
    value: this.props.currentValue || '',
  };

  inputRef = React.createRef();

  componentDidMount() {
    this.inputRef.current?.focus();
  }

  handleChange = event => {
    this.setState({errorType: null, value: event.target.value});
  };

  handleSubmit = event => {
    event.preventDefault();
    this.handleSubmitWrapper(this.state.value);
  };

  handleSubmitWrapper = async url => {
    if (ABSOLUTE_REGEXP.test(url)) {
      analyticsReporter.sendEvent(EVENTS.SUBMIT_IMAGE_URL, {LabType: 'applab'});
      const normalizedUrl = url.replace(HTTP_PREFIX_REGEX, 'https://');
      this.setState({isSubmitting: true});
      const moderationStatus = await moderateImageUrl(normalizedUrl, 'applab', {
        uploaderType: 'ImageURLInput',
        assetUrl: normalizedUrl,
      });
      this.setState({isSubmitting: false});

      if (moderationStatus === 'safe') {
        this.props.assetChosen(normalizedUrl, moment());
      } else if (moderationStatus === 'flagged') {
        this.setState({errorType: 'flagged'});
      } else {
        this.setState({errorType: 'moderation-error'});
      }
    } else {
      this.setState({errorType: 'invalid-url'});
    }
  };

  getErrorText = () => {
    const {errorType} = this.state;
    if (errorType === 'invalid-url') {
      return i18n.imageURLInputInvalid();
    }
    if (errorType === 'flagged') {
      return FLAGGED_IMAGE_URL_ERROR;
    }
    if (errorType === 'moderation-error') {
      return MODERATION_ERROR;
    }
    return null;
  };

  render() {
    return (
      <div>
        <MuiTypography
          variant="body2"
          component="div"
          gutterBottom
          sx={{marginTop: '1em'}}
        >
          {i18n.imageURLInputDescription()}
        </MuiTypography>
        <form
          onSubmit={this.handleSubmit}
          style={{display: 'flex', flexDirection: 'column', gap: 8}}
        >
          <TextField
            ref={this.inputRef}
            name="imageUrl"
            label={i18n.imageURLInputPrompt()}
            value={this.state.value}
            onChange={this.handleChange}
            style={{width: '100%'}}
          />
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={this.state.isSubmitting}
            sx={{alignSelf: 'flex-start'}}
          >
            Submit
          </MuiButton>
        </form>
        {this.getErrorText() && (
          <MuiTypography
            variant="body2"
            component="div"
            sx={{color: 'var(--text-error-primary)'}}
          >
            {this.getErrorText()}
          </MuiTypography>
        )}
        <MuiTypography variant="body2" component="div" gutterBottom>
          {i18n.imageURLInputExample()}
        </MuiTypography>
      </div>
    );
  }
}
