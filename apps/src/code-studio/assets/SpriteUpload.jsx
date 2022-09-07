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
const TestStatus = makeEnum('pending', 'pass', 'fail', 'warn');
const StatusIconClasses = {
  pending: 'fa-square-o',
  pass: 'fa-check-square-o',
  fail: 'fa-exclamation-triangle',
  warn: 'fa-exclamation-triangle'
};

// Metadata is generated based on image preview. The image width is restricted by the container <div/>

const maxWidth = 970;
const minRecommendedSize = 400;
const TestFeedback = {
  extensionError: 'Image must use .png extension.',
  filenameError: 'Filename cannot include spaces or capital letters.',
  largeImageError: `Image width must be less than ${maxWidth} pixels.`,
  smallImageWarning: `Images less than ${minRecommendedSize}x${minRecommendedSize} pixels are not recommended.`
};
// Levelbuilder tool for adding sprites to the Spritelab animation library.
export default class SpriteUpload extends React.Component {
  state = {
    fileData: null,
    filePreviewURL: '',
    filename: '',
    imageDimensions: '',
    imageExtension: '',
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
    extensionError: TestStatus.pending,
    largeImageError: TestStatus.pending,
    smallImageWarning: TestStatus.pending,
    filenameError: TestStatus.pending
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
          status: 'none'
        },
        extensionError: TestStatus.pending,
        largeImageError: TestStatus.pending,
        smallImageWarning: TestStatus.pending,
        filenameError: TestStatus.pending,
        metadata: '',
        imageDimensions: ''
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
            me.setState({
              imageDimensions: `${this.width}x${this.height}`
            });
            const sizeIsTooLarge = this.width >= maxWidth;
            const sizeIsSmall =
              this.width < minRecommendedSize &&
              this.height < minRecommendedSize;
            if (sizeIsTooLarge) {
              me.setState({
                uploadStatus: {
                  status: UploadStatus.badFile
                },
                largeImageError: TestStatus.fail,
                smallImageWarning: TestStatus.pass
              });
            } else if (sizeIsSmall) {
              me.setState({
                largeImageError: TestStatus.pass,
                smallImageWarning: TestStatus.warn
              });
            } else {
              me.setState({
                largeImageError: TestStatus.pass,
                smallImageWarning: TestStatus.pass
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
          this.setState({
            uploadStatus: {
              status: UploadStatus.badFile
            },
            extensionError: TestStatus.fail
          });
        } else {
          this.setState({
            extensionError: TestStatus.pass
          });
        }
        if (filenameIsInvalid) {
          this.setState({
            uploadStatus: {
              status: UploadStatus.badFile
            },
            filenameError: TestStatus.fail
          });
        } else {
          this.setState({
            filenameError: TestStatus.pass
          });
        }
        if (!extensionIsInvalid && !filenameIsInvalid) {
          this.setState(
            {
              uploadStatus: {
                status: UploadStatus.none
              }
            },
            () => {
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
    this.setState(
      {
        category: event.target.value,
        metadata: ''
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
        category: '',
        metadata: ''
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
  };

  handleAliasChange = event => {
    const aliases = event.target.value?.split(',') || [];
    let processedAliases = aliases.map(alias => alias.trim());
    this.setState({aliases: processedAliases});
  };

  // Set the upload status to indicate whether this file would override another
  determineIfSpriteAlreadyExists = (spriteAvailability, filename, category) => {
    if (this.state.uploadStatus.status !== 'none') {
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
    this.setState({
      uploadStatus: {status: uploadStatus, message: uploadStatusMessage}
    });
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
                  ...(this.state.extensionError === TestStatus.fail &&
                    styles.testFail)
                }}
              >
                {this.state.filename.split('.')[1]}
              </span>
              <br />
              Image dimensions:{' '}
              <span
                style={{
                  ...(this.state.largeImageError === TestStatus.fail &&
                    styles.testFail),
                  ...(this.state.smallImageWarning === TestStatus.warn &&
                    styles.testWarn)
                }}
              >
                {this.state.imageDimensions}
              </span>
            </p>
          </div>
          <div style={{...styles.inlineBlock, ...styles.testFeedback}}>
            <p>Tests performed on your file:</p>
            {//TODO: Fix - Each child in a list should have a unique "key" prop.
            Object.keys(TestFeedback).map(test => {
              const testStyle = {
                ...(this.state[test] === TestStatus.pass && styles.testPass),
                ...(this.state[test] === TestStatus.fail && styles.testFail),
                ...(this.state[test] === TestStatus.warn && styles.testWarn),
                ...(this.state[test] === TestStatus.pending &&
                  styles.testPending)
              };
              return (
                <p key={test} style={testStyle}>
                  <i
                    className={classNames(
                      'fa',
                      StatusIconClasses[this.state[test]]
                    )}
                  />
                  {` ${TestFeedback[test]}`}
                </p>
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
            {Object.keys(TestFeedback).map(test => {
              const testStyle = {
                ...(this.state[test] === TestStatus.fail && styles.testFail),
                ...(this.state[test] === TestStatus.warn && styles.testWarn)
              };
              return (
                (this.state[test] === TestStatus.fail ||
                  this.state[test] === TestStatus.warn) && (
                  <p key={test} style={testStyle}>
                    <i
                      className={classNames(
                        'fa',
                        StatusIconClasses[this.state[test]]
                      )}
                    />
                    {` ${TestFeedback[test]}`}
                  </p>
                )
              );
            })}
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
    backgroundColor: color.almost_white_cyan,
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
  testPending: {
    color: color.blue
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
