import React from 'react';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {
  getManifest,
  uploadSpriteToAnimationLibrary
} from '@cdo/apps/assetManagement/animationLibraryApi';

const SpriteLocation = makeEnum('library', 'level');

// Levelbuilder tool for adding sprites to the Spritelab animation library.
export default class SpriteUpload extends React.Component {
  state = {
    fileData: null,
    filePreviewURL: '',
    filename: '',
    spriteAvailability: '',
    category: '',
    currentCategories: [],
    uploadStatus: {
      success: null,
      message: ''
    }
  };

  componentDidMount() {
    getManifest('spritelab', 'en_us').then(data =>
      this.setState({currentCategories: Object.keys(data.categories)})
    );
  }

  handleSubmit = event => {
    event.preventDefault();
    const {spriteAvailability, fileData, category, filename} = this.state;

    let destination = null;

    switch (spriteAvailability) {
      case SpriteLocation.level:
        destination = `/level_animations/${filename}`;
        break;
      case SpriteLocation.library:
        destination = `/spritelab/category_${category}/${filename}`;
        break;
    }

    return uploadSpriteToAnimationLibrary(
      destination,
      fileData,
      this.onSuccess,
      this.onError
    );
  };

  onSuccess = response => {
    let responseMessage = response.ok
      ? 'Image Successfully Uploaded'
      : `Error(${response.status}: ${response.statusText})`;
    this.setState({
      uploadStatus: {success: response.ok, message: responseMessage}
    });
  };

  onError = error => {
    this.setState({
      uploadStatus: {success: false, message: error.toString()}
    });
    console.error(error);
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

  handleAvailabilityChange = event => {
    this.setState({spriteAvailability: event.target.value, category: ''});
  };

  render() {
    const {
      uploadStatus,
      filePreviewURL,
      currentCategories,
      spriteAvailability,
      category,
      filename
    } = this.state;

    const uploadButtonDisabled =
      spriteAvailability === '' ||
      (spriteAvailability === SpriteLocation.library && category === '') ||
      filename === '';

    return (
      <div>
        <h1>Sprite Lab Sprite Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            <h3>Sprite Category:</h3>
            <p>
              Select whether the sprite should only be available in a specific
              level or whether it should be available in the sprite library.
            </p>
            <div>
              <label>
                Level-specific sprite:
                <input
                  type="radio"
                  name="spriteAvailability"
                  style={styles.radioButton}
                  value={SpriteLocation.level}
                  onChange={this.handleAvailabilityChange}
                />
              </label>
              <label>
                Library sprite:
                <input
                  type="radio"
                  name="spriteAvailability"
                  style={styles.radioButton}
                  value={SpriteLocation.library}
                  onChange={this.handleAvailabilityChange}
                />
              </label>
            </div>
            {spriteAvailability === SpriteLocation.library && (
              <div>
                <label>Category:</label>
                <select onChange={this.handleCategoryChange}>
                  <option value="">Select an Option</option>
                  {(currentCategories || []).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </label>
          <label>
            <h3>Select Sprite to Add to Library:</h3>
            <input
              type="file"
              accept="image/png"
              ref="uploader"
              onChange={this.handleImageChange}
            />
          </label>
          <br />
          <label>
            <h3>Image Preview:</h3>
            <img src={filePreviewURL} />
          </label>
          <br />
          {!uploadButtonDisabled && (
            <button type="submit">Upload to Library</button>
          )}
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
  },
  radioButton: {
    margin: 10
  }
};
