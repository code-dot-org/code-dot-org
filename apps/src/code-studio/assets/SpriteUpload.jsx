import React from 'react';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {
  getManifest,
  uploadSpriteToAnimationLibrary,
  uploadJSONtoAnimationLibrary,
  UploadType
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
    aliases: [],
    metadata: '',
    imageUploadStatus: {
      success: null,
      message: ''
    },
    metadataUploadStatus: {
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
    const {
      spriteAvailability,
      fileData,
      category,
      filename,
      metadata
    } = this.state;

    let destination = null;

    switch (spriteAvailability) {
      case SpriteLocation.level:
        destination = `/level_animations/${filename}`;
        break;
      case SpriteLocation.library:
        destination = `/spritelab/category_${category}/${filename}`;
        break;
    }

    let JSONDestination = destination.replace('.png', '.json');

    return uploadSpriteToAnimationLibrary(
      destination,
      fileData,
      this.onSuccess,
      this.onError
    ).then(() =>
      uploadJSONtoAnimationLibrary(
        JSONDestination,
        metadata,
        this.onSuccess,
        this.onError
      )
    );
  };

  // 'uploadType' indicates whether the response comes from uploading the 'Image' file or the 'Metadata' file
  onSuccess = (uploadType, response) => {
    let responseMessage = response.ok
      ? `${uploadType} Successfully Uploaded`
      : `${uploadType} Upload Error(${response.status}: ${
          response.statusText
        })`;
    if (uploadType === UploadType.SPRITE) {
      this.setState({
        imageUploadStatus: {success: response.ok, message: responseMessage}
      });
    } else if (uploadType === UploadType.JSON) {
      this.setState({
        metadataUploadStatus: {success: response.ok, message: responseMessage}
      });
    }
  };

  // 'uploadType' indicates whether the response comes from uploading the 'Image' file or the 'Metadata' file
  onError = (uploadType, error) => {
    if (uploadType === UploadType.SPRITE) {
      this.setState({
        imageUploadStatus: {success: false, message: error.toString()}
      });
    } else if (uploadType === UploadType.JSON) {
      this.setState({
        metadataUploadStatus: {success: false, message: error.toString()}
      });
    }
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

  handleAliasChange = event => {
    let aliases = event.target.value;
    aliases = aliases.split(',');
    let processedAliases = aliases.map(alias => alias.trim());
    this.setState({aliases: processedAliases});
  };

  generateMetadata = () => {
    const {filename, aliases} = this.state;
    let image = document.getElementById('sprite-image-preview');
    let metadata = {};
    metadata['name'] = filename;
    metadata['aliases'] = aliases;
    metadata['frameCount'] = 1;
    metadata['frameSize'] = {x: image.width, y: image.height};
    metadata['looping'] = true;
    metadata['frameDelay'] = 2;
    this.setState({metadata: JSON.stringify(metadata)});
  };

  render() {
    const {
      imageUploadStatus,
      metadataUploadStatus,
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
        <h1>Sprite Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <h2 style={styles.spriteUploadStep}>
            Step 1: Select where the sprite should be uploaded
          </h2>
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

          <h2 style={styles.spriteUploadStep}>
            Step 2: Select the sprite to upload
          </h2>
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
            <img id="sprite-image-preview" src={filePreviewURL} />
          </label>
          <br />

          <h2 style={styles.spriteUploadStep}>
            Step 3: Generate metadata for the sprite
          </h2>
          <label>
            <h3>Enter the aliases for this sprite</h3>
            <p>
              Separate aliases by commas. Example: "peach, stonefruit,
              delicious"
            </p>
            <input type="text" onChange={this.handleAliasChange} />
          </label>
          <button type="button" onClick={this.generateMetadata}>
            Generate Sprite Metadata
          </button>
          <h3>Metadata JSON</h3>
          {!!this.state.metadata && (
            <p>
              <code>{this.state.metadata}</code>
            </p>
          )}
          <br />

          {!uploadButtonDisabled && (
            <div>
              <h2 style={styles.spriteUploadStep}>
                Step 4: Upload the sprite and metadata to sprite library
              </h2>
              <button type="submit">Upload to Library</button>
            </div>
          )}
          <p
            style={{
              ...styles.uploadStatusMessage,
              ...(!imageUploadStatus.success && styles.uploadFailure)
            }}
          >
            {imageUploadStatus.message}
          </p>
          <p
            style={{
              ...styles.uploadStatusMessage,
              ...(!metadataUploadStatus.success && styles.uploadFailure)
            }}
          >
            {metadataUploadStatus.message}
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
  },
  spriteUploadStep: {
    borderTop: '1px solid gray'
  }
};
