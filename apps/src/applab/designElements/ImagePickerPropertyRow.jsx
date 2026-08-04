import TextField from '@code-dot-org/component-library/textField';
import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';
import commonMsg from '@cdo/locale';

import {getStore} from '../../redux';

import * as rowStyle from './rowStyle';

// We'd prefer not to make GET requests every time someone types a character.
// This is the amount of time that must pass between edits before we'll do a GET
// I expect that the vast majority of time, people will be copy/pasting URLs
// instead of typing them manually, which will result in an immediate GET,
// unless they pasted within USER_INPUT_DELAY ms of editing the field manually
const USER_INPUT_DELAY = 1500;
const HTTP_PREFIX_REGEX = /^http:\/\//i;
const FLAGGED_IMAGE_URL_ERROR =
  'This image URL cannot be used because it may contain inappropriate content.';
const MODERATION_ERROR =
  "We couldn't check this image link right now. Please try a different image link or upload a file.";

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
    errorMessage: null,
    value: this.props.initialValue,
    lastEdit: 0,
  };

  moderationRequestId = 0;

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
    this.changeImageInternal(filename, timestamp);
  };

  changeImageInternal = async (filename, timestamp) => {
    // Absolute URLs typed directly in the property row bypass the URL picker,
    // so moderate them before applying.
    if (ABSOLUTE_REGEXP.test(filename) && !timestamp) {
      const normalizedUrl = filename.replace(HTTP_PREFIX_REGEX, 'https://');
      const requestId = ++this.moderationRequestId;
      const moderationStatus = await moderateImageUrl(normalizedUrl, 'applab', {
        uploaderType: 'ImageURLInput',
        assetUrl: normalizedUrl,
      });

      if (requestId !== this.moderationRequestId) {
        return;
      }

      if (moderationStatus === 'flagged') {
        if (this.isMounted_) {
          this.setState({errorMessage: FLAGGED_IMAGE_URL_ERROR});
        }
        return;
      }

      if (moderationStatus === 'error') {
        if (this.isMounted_) {
          this.setState({errorMessage: MODERATION_ERROR});
        }
        return;
      }

      this.props.handleChange(normalizedUrl, timestamp);
      if (this.isMounted_) {
        this.setState({value: normalizedUrl, errorMessage: null});
      }
      return;
    }

    this.props.handleChange(filename, timestamp);
    // Because we delay the call to this function via setTimeout, we must be sure not
    // to call setState after the component is unmounted, or React will warn and
    // tests will fail.
    if (this.isMounted_) {
      this.setState({value: filename, errorMessage: null});
    }
  };

  render() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box style={rowStyle.container}>
          <TextField
            id="imagePickerInput"
            name={''}
            label={this.props.desc}
            value={this.state.value}
            onChange={this.handleChangeInternal}
            size="s"
            style={{width: '100%'}}
          />
          <MuiButton
            aria-label="Open image chooser"
            variant="outlined"
            color="secondary"
            size="extraSmall"
            type="button"
            sx={{
              height: '2rem',
              marginTop: '1.375rem',
            }}
            onClick={this.handleButtonClick}
          >
            {commonMsg.choosePrefix()}
          </MuiButton>
        </Box>
        {this.state.errorMessage && (
          <MuiTypography
            role="alert"
            variant="body2"
            component="div"
            sx={{color: 'var(--text-error-primary)'}}
          >
            {this.state.errorMessage}
          </MuiTypography>
        )}
      </Box>
    );
  }
}
