import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

import LessonEditorDialog from './LessonEditorDialog';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

export default class UploadImageDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired
  };

  state = {
    imgUrl: undefined,
    expandable: false,
    error: undefined
  };

  resetState = () => {
    this.setState({
      imgUrl: undefined,
      expandable: false,
      error: undefined
    });
  };

  handleChange = e => {
    this.resetState();

    // assemble upload data
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    // POST
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch('/level_assets/upload', {
      method: 'post',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfContainer && csrfContainer.content
      }
    })
      .then(response => response.json())
      .then(this.handleResult)
      .catch(this.handleError);
  };

  handleResult = result => {
    if (result && result.newAssetUrl) {
      this.setState({imgUrl: result.newAssetUrl});
    } else if (result && result.message) {
      this.handleError(result.message);
    } else {
      this.handleError(result);
    }
  };

  handleError = error => {
    this.setState({error: error});
  };

  handleClose = () => {
    this.resetState();
    this.props.handleClose();
  };

  handleCloseAndSave = () => {
    if (this.state.imgUrl) {
      this.props.uploadImage(this.state.imgUrl, this.state.expandable);
    }

    this.handleClose();
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
      >
        <h2>Upload Image</h2>

        {this.state.imgUrl && <img src={this.state.imgUrl} />}
        <input type="file" name="file" onChange={this.handleChange} />

        {this.state.error && (
          <div className="alert alert-error" role="alert">
            <span>{this.state.error.toString()}</span>
          </div>
        )}

        <label style={styles.label}>
          Expandable
          <input
            type="checkbox"
            checked={this.state.expandable}
            style={styles.checkbox}
            onChange={e => this.setState({expandable: e.target.checked})}
          />
          <HelpTip>
            <p>
              Check if you want the image to be able to be enlarged in a dialog
              over the page when clicked.
            </p>
          </HelpTip>
        </label>

        <hr />

        <Button
          text={i18n.closeAndSave()}
          onClick={this.handleCloseAndSave}
          color={Button.ButtonColor.orange}
          className="save-upload-image-button"
        />
      </LessonEditorDialog>
    );
  }
}

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  label: {
    margin: '10px 0'
  }
};
