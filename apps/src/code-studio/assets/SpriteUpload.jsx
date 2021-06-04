import React from 'react';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {
  getManifest,
  uploadSpriteToAnimationLibrary,
  uploadMetadataToAnimationLibrary
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

    // The sprite and metadata JSON should have the same name, but different file extensions
    let jsonDestination = destination.replace('.png', '.json');

    return uploadSpriteToAnimationLibrary(destination, fileData)
      .then(() => uploadMetadataToAnimationLibrary(jsonDestination, metadata))
      .then(() => {
        this.setState({
          uploadStatus: {
            success: true,
            message: 'Successfully Uploaded Sprite and Metadata'
          }
        });
      })
      .catch(error => {
        if (error) {
          console.log(error);
        }
        this.setState({
          uploadStatus: {
            success: false,
            message: `${error.toString()}: Error Uploading Sprite or Metadata. Please try again. If this occurs again, please reach out to an engineer.`
          }
        });
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

  handleAvailabilityChange = event => {
    this.setState({spriteAvailability: event.target.value, category: ''});
  };

  handleAliasChange = event => {
    const aliases = event.target.value?.split(',') || [];
    let processedAliases = aliases.map(alias => alias.trim());
    this.setState({aliases: processedAliases});
  };

  generateMetadata = () => {
    const {filename, aliases} = this.state;
    let image = this.refs.spritePreview;
    let metadata = {
      name: filename,
      aliases: aliases,
      frameCount: 1,
      frameSize: {x: image.clientWidth, y: image.clientHeight},
      looping: true,
      frameDelay: 2
    };
    this.setState({metadata: JSON.stringify(metadata)});
  };

  render() {
    const {
      uploadStatus,
      filePreviewURL,
      currentCategories,
      spriteAvailability,
      category,
      filename,
      metadata
    } = this.state;

    // Only display the upload button when the user has uploaded an image and generated metadata
    const uploadButtonDisabled =
      spriteAvailability === '' ||
      (spriteAvailability === SpriteLocation.library && category === '') ||
      filename === '' ||
      metadata === '';

    return (
      <div>
        <h1>Sprite Lab Sprite Upload</h1>
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
            <img ref="spritePreview" src={filePreviewURL} />
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
  },
  spriteUploadStep: {
    borderTop: '1px solid gray'
  }
};
