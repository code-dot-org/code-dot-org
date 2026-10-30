import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import {
  FLAGGED_IMAGE_URL_MESSAGE,
  IMAGE_MODERATION_ERROR_MESSAGE,
  IMAGE_URL_INPUT_INVALID_MESSAGE,
} from '@cdo/apps/applab/constants';
import {
  isAbsoluteImageUrl,
  moderateApplabImageUrl,
} from '@cdo/apps/applab/imageUrlModeration';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

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
    if (!isAbsoluteImageUrl(url)) {
      this.setState({errorType: 'invalid-url'});
      return;
    }

    analyticsReporter.sendEvent(EVENTS.SUBMIT_IMAGE_URL, {LabType: 'applab'});
    this.setState({isSubmitting: true});
    const {status, normalizedUrl} = await moderateApplabImageUrl(url);
    this.setState({isSubmitting: false});

    if (status === 'safe') {
      this.props.assetChosen(normalizedUrl, moment());
    } else if (status === 'flagged') {
      this.setState({errorType: 'flagged'});
    } else {
      this.setState({errorType: 'moderation-error'});
    }
  };

  getErrorText = () => {
    const {errorType} = this.state;
    if (errorType === 'invalid-url') {
      return IMAGE_URL_INPUT_INVALID_MESSAGE;
    }
    if (errorType === 'flagged') {
      return FLAGGED_IMAGE_URL_MESSAGE;
    }
    if (errorType === 'moderation-error') {
      return IMAGE_MODERATION_ERROR_MESSAGE;
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
            role="alert"
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
