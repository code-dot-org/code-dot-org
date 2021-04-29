import React from 'react';
import color from '@cdo/apps/util/color';

export default class SpriteUpload extends React.Component {
  state = {
    fileData: null,
    filePreviewURL: '',
    filename: '',
    category: '',
    currentCategories: [],
    uploadStatus: {
      success: null,
      message: ''
    }
  };

  handleSubmit = event => {
    event.preventDefault();

    let destination =
      this.state.category.length === 0
        ? `/level_animations/${this.state.filename}`
        : `/spritelab/category_${this.state.category}/${this.state.filename}`;

    return fetch(`/api/v1/animation-library` + destination, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png'
      },
      body: this.state.fileData
    })
      .then(response => {
        let responseMessage = response.ok
          ? 'Image Successfully Uploaded'
          : `Error(${response.status}: ${response.statusText})`;
        this.setState({
          uploadStatus: {success: response.ok, message: responseMessage}
        });
      })
      .catch(err => {
        this.setState({
          uploadStatus: {success: false, message: err.toString()}
        });
        console.error(err);
      });
  };

  handleImageChange = event => {
    let file = event.target.files[0];
    this.setState({
      fileData: file,
      filename: file.name,
      filePreviewURL: URL.createObjectURL(file),
      uploadStatus: {success: null, message: ''}
    });
  };

  handleCategoryChange = event => {
    this.setState({
      category: event.target.value
    });
  };

  render() {
    const {uploadStatus, filePreviewURL, category} = this.state;
    fetch(`/api/v1/animation-library/manifest/spritelab/en_us`)
      .then(response => response.json())
      .then(data =>
        this.setState({currentCategories: Object.keys(data.categories)})
      );
    return (
      <div>
        <h1>Sprite Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            <h4>Sprite Category:</h4>
            <p>
              Enter the category to which this sprite belongs. Leave blank if
              the sprite should be uploaded to the level-specific animations
              folder.
            </p>
            <input
              type="text"
              value={category}
              onChange={this.handleCategoryChange}
            />
          </label>
          <label>
            <h4>Select Sprite to Add to Library:</h4>
            <input
              type="file"
              accept="image/png"
              ref="uploader"
              onChange={this.handleImageChange}
            />
          </label>
          <br />
          <label>
            <h4>Image Preview:</h4>
            <img src={filePreviewURL} />
          </label>
          <br />
          <button type="submit">Upload to Library</button>
          <p
            style={{
              ...styles.uploadStatusMessage,
              ...(!uploadStatus.success && styles.uploadFailure)
            }}
          >
            {uploadStatus.message}
          </p>
        </form>
      </div>
    );
  }
}

const styles = {
  uploadStatusMessage: {
    fontSize: 20
  },
  uploadFailure: {
    color: color.red
  }
};
