/** @file Upload button wrapping a hidden uploader component. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import HiddenUploader from './HiddenUploader.jsx';

/**
 * A file upload component.
 */
export default class AssetUploader extends React.Component {
  static propTypes = {
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func,
    allowedExtensions: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    api: PropTypes.object.isRequired,
    projectType: PropTypes.string.isRequired,
  };

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked = () => {
    this.refs.uploader.openFileChooser();
  };

  render() {
    const {api} = this.props;
    let url = api.getUploadUrl();
    let uploadDone = api.wrapUploadDoneCallback(this.props.onUploadDone);
    let uploadStart = api.wrapUploadStartCallback(this.props.onUploadStart);

    return (
      <span>
        <HiddenUploader
          ref="uploader"
          toUrl={url}
          allowedExtensions={this.props.allowedExtensions}
          onUploadStart={uploadStart}
          onUploadDone={uploadDone}
          onUploadError={this.props.onUploadError}
        />
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          onClick={this.fileUploadClicked}
          id="upload-asset"
          disabled={!this.props.uploadsEnabled}
          startIcon={<FontAwesomeV6Icon iconName="upload" iconStyle="solid" />}
        >
          {i18n.uploadFile()}
        </MuiButton>
      </span>
    );
  }
}
