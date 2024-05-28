import React from 'react';

import {
  getManifest,
  getLevelAnimationsFiles,
  getSourceUrlForLevelAnimation,
  uploadAnimationToAnimationLibrary,
  uploadMetadataToAnimationLibrary,
} from '@cdo/apps/assetManagement/animationLibraryApi';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';

import ValidationStep, {Status} from '../../lib/ui/ValidationStep';

const EXTENSION_CHECK = 'extensionError';
const FILENAME_CHECK = 'filenameError';
const FILESIZE_CHECK = 'filesizeError';
const ANIMATION_EXISTS_CHECK = 'animationExistsError';
const AnimationLocations = makeEnum('library', 'level');

const initialSpriteLabLibrariesState = {
  spriteLabLevelAnimations: {},
  spriteLabLibraryCategories: [],
  spriteLabLibraryAnimations: {},
};

const newImageState = {
  fileData: null,
  filename: '',
  filePreviewURL: '',
};

const imageChecksInitialState = {
  [EXTENSION_CHECK]: Status.WAITING,
  [FILENAME_CHECK]: Status.WAITING,
  [FILESIZE_CHECK]: Status.WAITING,
  [ANIMATION_EXISTS_CHECK]: Status.WAITING,
};

const initialUserInputMetaData = {
  availability: '',
  category: '',
  aliases: [],
};

const initialGeneratedMetadata = {
  frameSize: {x: NaN, y: NaN},
  destination: '',
  metadata: '',
};

const initialComponentState = {
  ...newImageState,
  ...imageChecksInitialState,
  ...initialGeneratedMetadata,
};

const maxSize = 800;
const minSize = 100;

// Levelbuilder tool for adding animations to the Spritelab animation library.
export default class AnimationUpload extends React.Component {
  state = {
    ...initialSpriteLabLibrariesState,
    ...initialUserInputMetaData,
    ...initialComponentState,
    uploadStatus: Status.WAITING,
    errorMessage: '',
  };

  componentDidMount() {
    // Get list of animations from level-specific folder
    getLevelAnimationsFiles().then(files => {
      this.setState({spriteLabLevelAnimations: files});
    });

    // Get data from the spritelab animation library manifest
    getManifest('spritelab', 'en_us').then(data => {
      this.setState({
        spriteLabLibraryCategories: Object.keys(data.categories),
        spriteLabLibraryAnimations: data.metadata,
      });
    });
  }

  // The submit button is used to upload the selected image file (png) and corresponding
  // generated metadata (.json) to the selected destination on S3.
  handleSubmit = event => {
    event.preventDefault();
    this.setState({
      uploadStatus: Status.UNKNOWN,
    });
    const {availability, fileData, category, filename, metadata} = this.state;

    let destination = null;

    switch (availability) {
      case AnimationLocations.level:
        destination = `/level_animations/${filename}`;
        break;
      case AnimationLocations.library:
        destination = `/spritelab/category_${category}/${filename}`;
        break;
    }

    // The image and metadata JSON should have the same name, but different file extensions
    let jsonDestination = destination.replace('.png', '.json');

    return uploadAnimationToAnimationLibrary(destination, fileData)
      .then(() => uploadMetadataToAnimationLibrary(jsonDestination, metadata))
      .then(() => {
        this.setState(
          {
            uploadStatus: Status.CELEBRATING,
          },
          () => {
            this.setState({...initialComponentState});
          }
        );
      })
      .catch(error => {
        if (error) {
          console.log(error);
        }
        this.setState({
          uploadStatus: Status.FAILED,
          errorMessage: `${error.toString()}: Error Uploading Image or Metadata. Please try again. If this occurs again, please reach out to an engineer.`,
        });
      });
  };

  handleImageChange = event => {
    // Reset state and return early if no file was selected.
    if (event.target.files.length === 0) {
      this.setState({
        ...newImageState,
        ...imageChecksInitialState,
        ...initialGeneratedMetadata,
      });
      return;
    }

    const file = event.target.files[0];
    this.setState(
      {
        fileData: file,
        filename: file.name,
        filePreviewURL: URL.createObjectURL(file),
        ...imageChecksInitialState,
        ...initialGeneratedMetadata,
        uploadStatus: Status.WAITING,
        replaceExistingAnimation: false,
      },
      () => {
        // If the user has already completed Step 2, we can already check whether the animation exists.
        if (
          this.state.category ||
          this.state.availability === AnimationLocations.level
        ) {
          this.determineIfAnimationAlreadyExists(
            this.state.availability,
            this.state.filename,
            this.state.category,
            this.state.fileData
          );
        }
        const AnimationUpload = this;

        var reader = new FileReader();
        //Read the contents of Image File.
        reader.readAsDataURL(file);
        reader.onload = function (e) {
          //Initiate the JavaScript Image object.
          var image = new Image();
          //Set the Base64 string return from FileReader as source.
          image.src = e.target.result;
          //Validate the File Height and Width.
          image.onload = function () {
            AnimationUpload.setState({
              frameSize: {x: this.width, y: this.height},
            });
            const sizeIsTooLarge =
              this.width > maxSize || this.height > maxSize;
            const sizeIsTooSmall =
              this.width < minSize && this.height < minSize;
            AnimationUpload.setState({
              [FILESIZE_CHECK]:
                sizeIsTooLarge || sizeIsTooSmall
                  ? Status.FAILED
                  : Status.SUCCEEDED,
            });
          };
        };
        // File should be .png
        const extensionIsInvalid = !file.name.toLowerCase().endsWith('.png');
        // Filename cannot contain spaces or capital letters.
        const filenameIsInvalid =
          file.name.includes(' ') || /[A-Z]/.test(file.name);
        this.setState({
          [FILENAME_CHECK]: filenameIsInvalid
            ? Status.FAILED
            : Status.SUCCEEDED,
          [EXTENSION_CHECK]: extensionIsInvalid
            ? Status.FAILED
            : Status.SUCCEEDED,
        });
      }
    );
  };

  handleAvailabilityChange = event => {
    const value = event.target.value;
    let {filename, category, fileData} = this.state;
    this.setState(
      {
        availability: value || this.state.availability,
        category: '',
        metadata: '',
        destination: '',
        [ANIMATION_EXISTS_CHECK]: Status.WAITING,
        replaceExistingAnimation: false,
      },
      () => {
        if (this.state.availability === AnimationLocations.level) {
          this.determineIfAnimationAlreadyExists(
            value,
            filename.split('.')[0],
            category,
            fileData
          );
        }
      }
    );
  };

  handleCategoryChange = event => {
    const value = event.target.value;
    let {filename, availability, fileData} = this.state;
    this.setState(
      {
        category: value,
        metadata: '',
        [ANIMATION_EXISTS_CHECK]: Status.WAITING,
        replaceExistingAnimation: false,
      },
      () => {
        this.determineIfAnimationAlreadyExists(
          availability,
          filename.split('.')[0],
          value,
          fileData
        );
      }
    );
  };

  handleAliasChange = event => {
    const aliases = event.target.value?.split(',') || [];
    let processedAliases = aliases.map(alias => alias.trim());
    this.setState({aliases: processedAliases, metadata: ''});
  };

  // Set the upload status to indicate whether this file would override another
  determineIfAnimationAlreadyExists = (
    availability,
    filename,
    category,
    fileData
  ) => {
    if (!fileData) {
      return;
    }
    if (availability === AnimationLocations.library && category === '') {
      this.setState({
        [ANIMATION_EXISTS_CHECK]: Status.WAITING,
        destination: 'No category selected',
      });
      return;
    }
    let {spriteLabLevelAnimations, spriteLabLibraryAnimations} = this.state;
    let destination, animationExists;
    switch (availability) {
      case AnimationLocations.level:
        destination = `level_animations/${filename}`;
        animationExists = Object.keys(spriteLabLevelAnimations).includes(
          destination
        );
        break;
      case AnimationLocations.library:
        destination = `category_${category}/${filename}`;
        animationExists = Object.keys(spriteLabLibraryAnimations).includes(
          destination
        );
        break;
    }
    this.setState({
      [ANIMATION_EXISTS_CHECK]: animationExists
        ? Status.ALERT
        : Status.SUCCEEDED,
      destination: destination,
    });
  };

  generateMetadata = () => {
    const {filename, aliases, category} = this.state;
    const metadata = {
      name: filename.split('.')[0],
      aliases: aliases,
      frameCount: 1,
      frameSize: this.state.frameSize,
      looping: true,
      frameDelay: 2,
      categories: [category],
    };
    this.setState({metadata: JSON.stringify(metadata)});
  };

  animationExistsMessage() {
    switch (this.state[ANIMATION_EXISTS_CHECK]) {
      case Status.SUCCEEDED:
        return 'This path and filename are available.';
      case Status.ALERT:
        return 'Filename already exists at this path. Would you like to replace the existing animation and metadata?';
      case Status.WAITING:
        return 'Select a file and destination above.';
    }
  }

  uploadStatusMessage() {
    switch (this.state.uploadStatus) {
      case Status.CELEBRATING:
        return 'Animation uploaded successfully!';
      case Status.UNKNOWN:
        return 'Upload in progress...';
      case Status.FAILED:
        return this.state.errorMessage;
      case Status.WAITING:
        return 'Waiting...';
    }
  }

  handleReplaceExistingAnimation = event => {
    this.setState({replaceExistingAnimation: event.target.checked});
  };

  validImage = () => {
    const statusChecksPassed = [
      this.state[EXTENSION_CHECK],
      this.state[FILENAME_CHECK],
      this.state[FILESIZE_CHECK],
    ].every(status => status === Status.SUCCEEDED);
    const animationExistsCheckPassed =
      this.state[ANIMATION_EXISTS_CHECK] === Status.SUCCEEDED ||
      (this.state[ANIMATION_EXISTS_CHECK] === Status.ALERT &&
        this.state.replaceExistingAnimation);

    return statusChecksPassed && animationExistsCheckPassed;
  };

  getExistingAnimationSrc = () => {
    const {availability, destination} = this.state;

    if (availability === AnimationLocations.level) {
      const {filename, spriteLabLevelAnimations} = this.state;
      const versionId = spriteLabLevelAnimations[destination]?.png.version_id;
      return getSourceUrlForLevelAnimation(versionId, filename);
    }

    if (availability === AnimationLocations.library) {
      const {spriteLabLibraryAnimations} = this.state;
      return spriteLabLibraryAnimations[destination]?.sourceUrl;
    }

    return '';
  };

  render() {
    const {
      filePreviewURL,
      filename,
      frameSize,
      availability,
      category,
      destination,
      spriteLabLevelAnimations,
      spriteLabLibraryAnimations,
      spriteLabLibraryCategories,
      metadata,
      uploadStatus,
    } = this.state;
    const validImage = this.validImage();
    const validCategory =
      category !== '' || availability === AnimationLocations.level;
    const animationExistsStatus = this.state[ANIMATION_EXISTS_CHECK];

    const librariesLoaded =
      Object.keys(spriteLabLevelAnimations).length > 0 &&
      Object.keys(spriteLabLibraryAnimations).length > 0 &&
      spriteLabLibraryCategories.length > 0;
    const metadataButtonDisabled = !validImage || !validCategory;
    const uploadButtonDisabled = !validImage || !validCategory || !metadata;

    return (
      <div>
        <a href="/sprites">Back to Asset Management</a>
        <h1>Sprite Lab Animation Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <h2 style={styles.animationUploadStep}>
            Step 1: Select an image to upload
          </h2>
          <div>
            <label>
              <h3>Choose a file from your computer:</h3>
              <input
                type="file"
                accept="image/png"
                ref="uploader"
                onChange={this.handleImageChange.bind(this)}
              />
            </label>
            <p>
              File extension:{' '}
              <span
                style={{
                  ...(this.state[EXTENSION_CHECK] === Status.FAILED &&
                    styles.checkFail),
                }}
              >
                {filename.split('.')[1]}
              </span>
              <br />
              Image dimensions:{' '}
              <span
                style={{
                  ...(this.state[FILESIZE_CHECK] === Status.FAILED &&
                    styles.checkFail),
                }}
              >
                {frameSize.x && frameSize.y
                  ? `${frameSize.x}x${frameSize.y}`
                  : ''}
              </span>
            </p>
          </div>
          <div style={styles.testFeedbackBox}>
            <ValidationStep
              stepStatus={this.state[EXTENSION_CHECK]}
              stepName={
                this.state[EXTENSION_CHECK] === Status.SUCCEEDED
                  ? `${filename} is PNG format.`
                  : `${filename || 'Image file'} must be PNG format.`
              }
              hideWaitingSteps={false}
            />
            <ValidationStep
              stepStatus={this.state[FILENAME_CHECK]}
              stepName={
                this.state[FILENAME_CHECK] === Status.SUCCEEDED
                  ? 'Filename does not contain spaces or capital letters.'
                  : 'Filenames cannot contain spaces or capital letters.'
              }
              hideWaitingSteps={false}
            />
            <ValidationStep
              stepStatus={this.state[FILESIZE_CHECK]}
              stepName={
                this.state[FILESIZE_CHECK] === Status.SUCCEEDED
                  ? `Image size is between ${minSize}x${minSize} and ${maxSize}x${maxSize}.`
                  : `Image size must be between ${minSize}x${minSize} and ${maxSize}x${maxSize}.`
              }
              hideWaitingSteps={false}
            />
          </div>
          <label>
            <h3>Image Preview:</h3>
            {
              // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
              // Verify or update this alt-text as necessary
            }
            <img ref="imagePreview" src={filePreviewURL} alt="" />
          </label>
          <h2 style={styles.animationUploadStep}>
            Step 2: Settings and Metadata
          </h2>
          <h3>Availability:</h3>
          <p>
            Select whether the animation (sprite costume or background) should
            be available just in certain curriculum levels or whether it should
            also be available in the Costume/Background Library.
            <br />
            Note: Library animations will be available to all users INSTANTLY.
          </p>
          {!librariesLoaded && (
            <div style={styles.testFeedbackBox}>
              <ValidationStep
                stepStatus={Status.WAITING}
                stepName={
                  'Please wait while the animation libraries are loaded.'
                }
                hideWaitingSteps={false}
              />
              This can take over one minute.
            </div>
          )}
          {librariesLoaded && (
            <div>
              <label>
                Level-specific animation:
                <input
                  type="radio"
                  name="availability"
                  style={styles.radioButton}
                  value={AnimationLocations.level}
                  onChange={this.handleAvailabilityChange}
                />
              </label>
              <label>
                Library animation:
                <input
                  type="radio"
                  name="availability"
                  style={styles.radioButton}
                  value={AnimationLocations.library}
                  onChange={this.handleAvailabilityChange}
                />
              </label>
              {availability === AnimationLocations.level && (
                <div>
                  <label>Type:</label>
                  <select onChange={this.handleCategoryChange}>
                    <option value="">Sprite Costume</option>
                    <option value="backgrounds">Background</option>
                  </select>
                </div>
              )}
              {availability === AnimationLocations.library && (
                <div>
                  <label>Category:</label>
                  <select onChange={this.handleCategoryChange}>
                    <option value="">Select an Option</option>
                    {(spriteLabLibraryCategories || []).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              Animation Upload Destination:{' '}
              <span
                style={{
                  ...(animationExistsStatus === Status.FAILED &&
                    styles.checkFail),
                }}
              >
                {destination}
              </span>
              <div style={styles.testFeedbackBox}>
                <ValidationStep
                  stepStatus={animationExistsStatus}
                  stepName={this.animationExistsMessage()}
                  hideWaitingSteps={false}
                />
                {animationExistsStatus === Status.ALERT && (
                  <div style={styles.animationReplace}>
                    {
                      // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
                      // Verify or update this alt-text as necessary
                    }
                    <img src={this.getExistingAnimationSrc()} alt="" />
                    <label>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        value={this.state.replaceExistingAnimation}
                        onChange={this.handleReplaceExistingAnimation}
                      />
                      Replace animation
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <label>
            <h3>
              Enter the aliases for this{' '}
              {category === 'backgrounds' ? 'background' : 'sprite costume'}
            </h3>
            <p>
              Separate aliases by commas. Example: "peach, stonefruit,
              delicious"
            </p>
            <input type="text" onChange={this.handleAliasChange} />
          </label>
          <button
            type="button"
            onClick={this.generateMetadata}
            disabled={metadataButtonDisabled}
            style={{
              ...(metadataButtonDisabled && styles.disabledButton),
            }}
          >
            Generate Metadata
          </button>
          <h3>Metadata JSON</h3>
          {!!metadata && (
            <p>
              <code>{metadata}</code>
            </p>
          )}
          <br />
          <div>
            <h2 style={styles.animationUploadStep}>
              Step 3: Upload image and metadata to S3
            </h2>
            <SafeMarkdown
              markdown={
                'If you upload an image and metadata as a library animation, please request an engineer to update the `spritelabCostumeLibrary.json` file located in S3 - [reference doc](https://docs.google.com/document/d/1ytp-ss-TBKxgULI2kybSaDNF-tLLbVII6OYxuFP9_8k/edit).'
              }
            />
            <button
              type="submit"
              disabled={uploadButtonDisabled}
              style={{
                ...(uploadButtonDisabled && styles.disabledButton),
              }}
            >
              Upload to Library
            </button>
            <div style={styles.testFeedbackBox}>
              <ValidationStep
                stepStatus={uploadStatus}
                stepName={this.uploadStatusMessage()}
                hideWaitingSteps={true}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const styles = {
  animationUploadStep: {
    borderTop: '1px solid gray',
  },
  checkFail: {
    color: color.red,
  },
  disabledButton: {
    color: color.lighter_gray,
  },
  radioButton: {
    margin: 10,
  },
  animationReplace: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  checkbox: {
    margin: '0 4px',
  },
  testFeedbackBox: {
    backgroundColor: color.almost_white_cyan,
    padding: 25,
  },
};
