import React from 'react';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {
  getManifest,
  getLevelAnimationsFiles,
  uploadSpriteToAnimationLibrary,
  uploadMetadataToAnimationLibrary
} from '@cdo/apps/assetManagement/animationLibraryApi';
import classNames from 'classnames';

const SpriteLocation = makeEnum('library', 'level');
const UploadStatus = makeEnum(
  'fail',
  'success',
  'filenameOverride',
  'badFile',
  'none'
);
const Feedback = {
  extensionError: 'Image must use .png extension.',
  largeImageError: 'Image must not exceed 400x400',
  smallImageWarning: 'Image below 400x400 are not recommended.',
  filenameError: 'Filename cannot include spaces or capital letters.'
};

// Levelbuilder tool for adding sprites to the Spritelab animation library.
export default class SpriteUpload extends React.Component {
  state = {
    fileData: null,
    filePreviewURL: '',
    filename: '',
    spriteAvailability: '',
    category: '',
    currentCategories: [],
    currentLibrarySprites: [],
    currentLevelSprites: [],
    aliases: [],
    metadata: '',
    uploadStatus: {
      status: UploadStatus.none,
      message: ''
    },
    extensionError: false,
    largeImageError: false,
    smallImageWarning: false,
    filenameError: false
  };

  componentDidMount() {
    // Get list of sprites from level-specific folder
    getLevelAnimationsFiles().then(files => {
      this.setState({currentLevelSprites: Object.keys(files)});
    });

    // Get data from the spritelab library manifest
    getManifest('spritelab', 'en_us').then(data => {
      this.setState({
        currentCategories: Object.keys(data.categories),
        currentLibrarySprites: Object.keys(data.metadata)
      });
    });
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
            status: UploadStatus.success,
            message: 'Successfully Uploaded Image and Metadata'
          }
        });
      })
      .catch(error => {
        if (error) {
          console.log(error);
        }
        this.setState({
          uploadStatus: {
            status: UploadStatus.failure,
            message: `${error.toString()}: Error Uploading Image or Metadata. Please try again. If this occurs again, please reach out to an engineer.`
          }
        });
      });
  };

  handleImageChange = event => {
    let file = event.target.files[0];

    this.setState(
      {
        fileData: file,
        filename: file.name,
        filePreviewURL: URL.createObjectURL(file),
        uploadStatus: {
          status: 'none',
          message: ''
        },
        extensionError: false,
        largeImageError: false,
        smallImageWarning: false,
        filenameError: false
      },
      () => {
        const me = this;
        let {spriteAvailability, category} = this.state;
        var reader = new FileReader();

        //Read the contents of Image File.
        reader.readAsDataURL(file);
        reader.onload = function(e) {
          //Initiate the JavaScript Image object.
          var image = new Image();

          //Set the Base64 string return from FileReader as source.
          image.src = e.target.result;

          //Validate the File Height and Width.
          image.onload = function() {
            const sizeIsTooLarge = this.width > 400 || this.height > 400;
            const sizeIsSmall = this.width < 400 && this.height < 400;
            if (sizeIsTooLarge) {
              me.setState(
                {
                  uploadStatus: {
                    status: UploadStatus.badFile,
                    message: `${
                      me.state.uploadStatus.message
                    } \nImage dimensions (${this.width}x${
                      this.height
                    }) are too ${
                      this.width > 400 || this.height > 400 ? 'large' : 'small'
                    }. Maximum size is 400x400. Please resize the image.`
                  },
                  largeImageError: true
                },
                () => {
                  console.log(me.state);
                }
              );
            } else if (sizeIsSmall) {
              console.warn(
                `small image detected: (${this.width}x${this.height})`
              );
              me.setState({
                smallImageWarning: true
              });
            }
          };
        };
        // File should be .png
        const extensionIsInvalid = !file.name.toLowerCase().endsWith('.png');
        // Filename cannot contain spaces or capital letters.
        const filenameIsInvalid =
          file.name.includes(' ') || /[A-Z]/.test(file.name);

        if (extensionIsInvalid) {
          console.log('extension invalid');
          this.setState(
            {
              uploadStatus: {
                status: UploadStatus.badFile,
                message:
                  'Image must be .png. Please convert the image and reupload.'
              },
              extensionError: true
            },
            () => {
              console.log(this.state);
            }
          );
        }
        if (filenameIsInvalid) {
          this.setState(
            {
              uploadStatus: {
                status: UploadStatus.badFile,
                message:
                  'Filenames cannot contain capital letters or spaces. Please rename the image and reupload.'
              },
              filenameError: true
            },
            () => {
              console.log(this.state);
            }
          );
        }
        if (!extensionIsInvalid && !filenameIsInvalid) {
          console.log('image looks good: ' + this.state.uploadStatus.status);
          this.setState(
            {
              uploadStatus: {
                status: UploadStatus.none,
                message: ''
              }
            },
            () => {
              console.log(this.state.uploadStatus);
              this.determineIfSpriteAlreadyExists(
                spriteAvailability,
                file.name.split('.')[0],
                category
              );
            }
          );
        }
      }
    );
  };

  handleCategoryChange = event => {
    event.persist();
    let {filename, spriteAvailability, fileData} = this.state;
    console.log(event);
    this.setState(
      {
        category: event.target.value
      },
      () => {
        if (fileData) {
          this.determineIfSpriteAlreadyExists(
            spriteAvailability,
            filename.split('.')[0],
            event.target.value
          );
        }
      }
    );
  };

  handleAvailabilityChange = event => {
    event.persist();
    let {filename, category, fileData} = this.state;

    this.setState(
      {
        spriteAvailability: event.target.value,
        category: ''
      },
      () => {
        if (fileData) {
          this.determineIfSpriteAlreadyExists(
            event.target.value,
            filename.split('.')[0],
            category
          );
        }
      }
    );

    console.log(this.state.uploadStatus);
  };

  handleAliasChange = event => {
    const aliases = event.target.value?.split(',') || [];
    let processedAliases = aliases.map(alias => alias.trim());
    this.setState({aliases: processedAliases});
    console.log(this.state.uploadStatus);
  };

  // Set the upload status to indicate whether this file would override another
  determineIfSpriteAlreadyExists = (spriteAvailability, filename, category) => {
    if (this.state.uploadStatus.status !== 'none') {
      console.log('skipping check...');
      console.log(this.state.uploadStatus.status);
      return;
    }
    let {currentLibrarySprites, currentLevelSprites} = this.state;
    let willOverride;
    switch (spriteAvailability) {
      case SpriteLocation.level:
        willOverride = currentLevelSprites.includes(
          `level_animations/${filename}`
        );
        break;
      case SpriteLocation.library:
        willOverride = currentLibrarySprites.includes(
          `category_${category}/${filename}`
        );
        break;
    }
    const uploadStatus = willOverride
      ? UploadStatus.filenameOverride
      : UploadStatus.none;
    const uploadStatusMessage = willOverride
      ? 'An animation already exists with this name. Please rename the image and re-upload.'
      : '';
    this.setState(
      {
        uploadStatus: {status: uploadStatus, message: uploadStatusMessage}
      },
      () => {
        console.log('determineIfSpriteAlreadyExists');
        console.log(this.state.uploadStatus);
      }
    );
  };

  generateMetadata = () => {
    const {filename, aliases, category} = this.state;
    const image = this.refs.spritePreview;
    const metadata = {
      name: filename.split('.')[0],
      aliases: aliases,
      frameCount: 1,
      frameSize: {x: image.clientWidth, y: image.clientHeight},
      looping: true,
      frameDelay: 2,
      categories: [category]
    };
    this.setState({metadata: JSON.stringify(metadata)});
    console.log(this.state.uploadStatus);
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

    const badImageFile =
      uploadStatus.status === UploadStatus.filenameOverride ||
      uploadStatus.status === UploadStatus.badFile;

    // Only display the upload button when the user has uploaded an image and generated metadata
    const uploadButtonDisabled =
      spriteAvailability === '' ||
      (spriteAvailability === SpriteLocation.library && category === '') ||
      filename === '' ||
      metadata === '' ||
      badImageFile;

    const uploadSuccessful = uploadStatus.status === UploadStatus.success;

    return (
      <div>
        <a href="/sprites">Back to Asset Management</a>
        <h1>Sprite Lab Animation Upload</h1>
        <form onSubmit={this.handleSubmit}>
          <h2 style={styles.spriteUploadStep}>
            Step 1: Select how the animation should be uploaded
          </h2>
          <h3>Destination:</h3>
          <p>
            Select whether the animation (sprite costume or background) should
            be available just in certain curriculum levels or whether it should
            also be available in the Costume/Background Library.
          </p>
          <div>
            <label>
              Level-specific animation:
              <input
                type="radio"
                name="spriteAvailability"
                style={styles.radioButton}
                value={SpriteLocation.level}
                onChange={this.handleAvailabilityChange}
              />
            </label>
            <label>
              Library animation:
              <input
                type="radio"
                name="spriteAvailability"
                style={styles.radioButton}
                value={SpriteLocation.library}
                onChange={this.handleAvailabilityChange}
              />
            </label>
          </div>
          {spriteAvailability === SpriteLocation.level && (
            <div>
              <label>Type:</label>
              <select onChange={this.handleCategoryChange}>
                <option value="">Sprite Costume</option>
                <option value="backgrounds">Background</option>
              </select>
            </div>
          )}
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
            Step 2: Select an image to upload
          </h2>
          <div style={styles.inlineBlock}>
            <label>
              <h3>Choose a file from your computer:</h3>
              <p>
                Images must be PNG, max 400x400. <br />
                Filename cannot contain spaces or capital letters.
              </p>
              <input
                type="file"
                accept="image/png"
                ref="uploader"
                onChange={this.handleImageChange.bind(this)}
              />
            </label>
          </div>
          <div style={{...styles.inlineBlock, ...styles.testFeedback}}>
            <p>File Checks:</p>
            {Object.entries(Feedback).map(test => {
              console.log(this.state[test[0]]);
              return (
                <>
                  <p
                    style={{
                      ...(this.state[test[0]]
                        ? test[0].endsWith('Warning')
                          ? styles.testWarn
                          : styles.testFail
                        : styles.testPass)
                    }}
                  >
                    {this.state[test[0]] && (
                      <i
                        className={classNames('fa', 'fa-exclamation-triangle')}
                      />
                    )}
                    {!this.state[test[0]] && (
                      <i className={classNames('fa', 'fa-check')} />
                    )}
                    {test[1]}
                  </p>
                </>
              );
            })}
          </div>
          <br />
          <label>
            <h3>Animation Preview:</h3>
            <img ref="spritePreview" src={filePreviewURL} />
          </label>

          <h2 style={styles.spriteUploadStep}>Step 3: Generate metadata</h2>
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
          <button type="button" onClick={this.generateMetadata}>
            Generate Metadata
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
                Step 4: Upload the image file and metadata to library
              </h2>
              <button type="submit">Upload to Library</button>
            </div>
          )}
          <p
            style={{
              ...styles.uploadStatusMessage,
              ...(!uploadSuccessful && styles.uploadFailure)
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
  inlineBlock: {
    display: 'inline-block'
  },
  testFeedback: {
    backgroundColor: color.gray,
    padding: 25
  },
  testPass: {
    color: color.green
  },
  testFail: {
    color: color.red
  },
  testWarn: {
    color: color.yellow
  },
  uploadStatusMessage: {
    float: 'left'
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
