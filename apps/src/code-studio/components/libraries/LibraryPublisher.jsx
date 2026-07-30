import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {findProfanity} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import libraryParser from './libraryParser';

/**
 * @readonly
 * @enum {string}
 */
export const PublishState = {
  DEFAULT: 'default',
  ERROR_PUBLISH: 'error_publish',
  INVALID_INPUT: 'invalid_input',
  PII_INPUT: 'pII_input',
  PROFANE_INPUT: 'profane_input',
  TOO_LONG: 'too_long',
  ERROR_UNPUBLISH: 'error_unpublish',
};

/**
 * An interactive page for a dialog that can be used to publish or unpublish
 * a library from a source project.
 */
export default class LibraryPublisher extends React.Component {
  static propTypes = {
    onPublishSuccess: PropTypes.func.isRequired,
    onUnpublishSuccess: PropTypes.func.isRequired,
    libraryDetails: PropTypes.object.isRequired,
    libraryClientApi: PropTypes.object.isRequired,
    onShareTeacherLibrary: PropTypes.func,
  };

  constructor(props) {
    super(props);

    // Filter out already-published functions that are now invalid.
    const initialSelectedFunctions = props.libraryDetails.selectedFunctions;
    let validSelectedFunctions = {};
    props.libraryDetails.sourceFunctionList.forEach(sourceFunction => {
      if (
        initialSelectedFunctions[sourceFunction.functionName] &&
        this.isFunctionValid(sourceFunction)
      ) {
        validSelectedFunctions[sourceFunction.functionName] = true;
      }
    });

    this.state = {
      publishState: PublishState.DEFAULT,
      libraryName: libraryParser.suggestName(props.libraryDetails.libraryName),
      libraryDescription: props.libraryDetails.libraryDescription,
      selectedFunctions: validSelectedFunctions,
      profaneWords: null,
      pIIWords: null,
    };
  }

  setLibraryName = event => {
    const {libraryName} = this.state;
    const sanitizedName = libraryParser.sanitizeName(event.target.value);
    if (sanitizedName === libraryName) {
      return;
    }
    this.setState({libraryName: sanitizedName});
  };

  getFunctionsToPublish = () => {
    const {selectedFunctions} = this.state;
    const {sourceFunctionList} = this.props.libraryDetails;
    return (sourceFunctionList || []).filter(sourceFunction => {
      return selectedFunctions[sourceFunction.functionName];
    });
  };

  validateAndPublish = async () => {
    const {libraryDescription, libraryName} = this.state;

    if (!(libraryDescription && this.getFunctionsToPublish().length > 0)) {
      this.setState({publishState: PublishState.INVALID_INPUT});
      return;
    }

    // Validate library name/description input for profanity before publishing.
    try {
      const profaneWords = await findProfanity(
        `${libraryName} ${libraryDescription}`
      );
      if (profaneWords && profaneWords.length > 0) {
        this.setState({
          publishState: PublishState.PROFANE_INPUT,
          profaneWords,
        });
      } else {
        this.publish();
      }
    } catch {
      // Still publish if request errors
      this.publish();
    }
  };

  publish = () => {
    const {libraryDescription, libraryName} = this.state;
    const {librarySource} = this.props.libraryDetails;
    const {libraryClientApi, onPublishSuccess} = this.props;

    const libraryJson = libraryParser.createLibraryJson(
      librarySource,
      this.getFunctionsToPublish(),
      libraryName,
      libraryDescription
    );

    // Publish to S3
    libraryClientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);

        // Note: Profanity checking student code happens before the LibraryPublisher is rendered,
        // and profanity checking the name/description happens before calling publish().
        if (error.message.includes('httpStatusCode: 413')) {
          this.setState({publishState: PublishState.TOO_LONG});
        } else if (error.cause?.pIIWords) {
          this.setState({
            publishState: PublishState.PII_INPUT,
            pIIWords: error.cause.pIIWords,
          });
        } else {
          this.setState({publishState: PublishState.ERROR_PUBLISH});
        }
      },
      data => {
        // Write to projects database
        dashboard.project.setLibraryDetails({
          libraryName,
          libraryDescription,
          publishing: true,
          latestLibraryVersion: data && data.versionId,
        });

        onPublishSuccess(libraryName);
      }
    );
  };

  displayNameInput = () => {
    const {libraryName} = this.state;
    return (
      <div>
        <TextField
          name="libraryName"
          value={libraryName}
          onChange={this.setLibraryName}
          onBlur={event =>
            this.setState({
              libraryName: libraryParser.suggestName(event.target.value),
            })
          }
        />
        <Typography variant="body3" component="div">
          {i18n.libraryNameRequirements()}
        </Typography>
      </div>
    );
  };

  resetErrorMessage = () => {
    const {libraryDescription, selectedFunctions, publishState} = this.state;
    if (
      libraryDescription &&
      Object.values(selectedFunctions).find(value => value) &&
      publishState === PublishState.INVALID_INPUT
    ) {
      this.setState({publishState: PublishState.DEFAULT});
    }
  };

  displayDescription = () => {
    const {libraryDescription} = this.state;
    return (
      <textarea
        id="ui-test-library-description"
        rows="2"
        cols="200"
        style={styles.description}
        placeholder={i18n.libraryDescriptionPlaceholder()}
        value={libraryDescription}
        onChange={event => {
          this.setState(
            {libraryDescription: event.target.value},
            this.resetErrorMessage
          );
        }}
      />
    );
  };

  hasComment = sourceFunction => {
    return (sourceFunction.comment || '').length > 0;
  };

  duplicateFunction = sourceFunction => {
    const {sourceFunctionList} = this.props.libraryDetails;
    const {functionName} = sourceFunction;
    return (
      sourceFunctionList.filter(source => source.functionName === functionName)
        .length > 1
    );
  };

  isFunctionValid = sourceFunction => {
    return (
      this.hasComment(sourceFunction) && !this.duplicateFunction(sourceFunction)
    );
  };

  boxChecked = sourceFunction => {
    // No-op if function is invalid
    if (!this.isFunctionValid(sourceFunction)) {
      return;
    }

    const name = sourceFunction.functionName;
    this.setState(state => {
      state.selectedFunctions[name] = !state.selectedFunctions[name];
      return state;
    }, this.resetErrorMessage);
  };

  displayFunctions = () => {
    const {selectedFunctions} = this.state;
    const {sourceFunctionList} = this.props.libraryDetails;
    return sourceFunctionList.map(sourceFunction => {
      const {functionName, comment} = sourceFunction;
      const checked = selectedFunctions[functionName] || false;

      return (
        <div key={functionName} style={styles.functionBlock}>
          <Checkbox
            name={functionName}
            label={functionName}
            size="l"
            disabled={!this.isFunctionValid(sourceFunction)}
            checked={checked}
            onChange={() => this.boxChecked(sourceFunction)}
          />
          {!this.hasComment(sourceFunction) && (
            <Typography
              variant="body3"
              sx={{color: 'var(--text-error-primary)'}}
            >
              {i18n.libraryExportNoCommentError()}
            </Typography>
          )}
          {this.duplicateFunction(sourceFunction) && (
            <Typography
              variant="body3"
              sx={{color: 'var(--text-error-primary)'}}
            >
              {i18n.libraryExportDuplicationFunctionError()}
            </Typography>
          )}
          <pre style={styles.textInput}>{comment}</pre>
        </div>
      );
    });
  };

  displayError = () => {
    const {publishState, pIIWords, profaneWords} = this.state;
    let errorMessage;
    switch (publishState) {
      case PublishState.INVALID_INPUT:
        errorMessage = i18n.libraryPublishInvalid();
        break;
      case PublishState.PII_INPUT:
        errorMessage = i18n.libraryDetailsPII({
          pIICount: pIIWords.length,
          pIIWords: pIIWords.join(', '),
        });
        break;
      case PublishState.PROFANE_INPUT:
        errorMessage = i18n.libraryDetailsProfanity({
          profanityCount: profaneWords.length,
          profaneWords: profaneWords.join(', '),
        });
        break;
      case PublishState.ERROR_PUBLISH:
        errorMessage = i18n.libraryPublishFail();
        break;
      case PublishState.TOO_LONG:
        errorMessage = i18n.libraryTooLongFail();
        break;
      case PublishState.ERROR_UNPUBLISH:
        errorMessage = i18n.libraryUnPublishFail();
        break;
      default:
        return;
    }
    return (
      <div>
        <Typography variant="body3" sx={{color: 'var(--text-error-primary)'}}>
          {errorMessage}
        </Typography>
      </div>
    );
  };

  unpublish = () => {
    const {libraryClientApi, onUnpublishSuccess} = this.props;
    libraryClientApi.delete(
      () => {
        dashboard.project.setLibraryDetails({
          libraryName: undefined,
          libraryDescription: undefined,
          publishing: false,
          latestLibraryVersion: -1,
        });
        onUnpublishSuccess();
      },
      error => {
        console.warn(`Error unpublishing library: ${error}`);
        this.setState({publishState: PublishState.ERROR_UNPUBLISH});
      }
    );
  };

  allFunctionsSelected = () => {
    const {sourceFunctionList} = this.props.libraryDetails;
    const {selectedFunctions} = this.state;

    let allSelected = true;
    sourceFunctionList.forEach(sourceFunction => {
      // If any *valid* functions are not selected, set allSelected to false.
      if (
        !selectedFunctions[sourceFunction.functionName] &&
        this.isFunctionValid(sourceFunction)
      ) {
        allSelected = false;
      }
    });

    return allSelected;
  };

  toggleAllFunctionsSelected = () => {
    if (this.allFunctionsSelected()) {
      this.setState({selectedFunctions: {}});
    } else {
      const {sourceFunctionList} = this.props.libraryDetails;
      let selectedFunctions = {};
      sourceFunctionList.forEach(sourceFunction => {
        if (this.isFunctionValid(sourceFunction)) {
          selectedFunctions[sourceFunction.functionName] = true;
        }
      });
      this.setState({selectedFunctions});
    }
  };

  render() {
    const {alreadyPublished} = this.props.libraryDetails;
    const {onShareTeacherLibrary} = this.props;

    return (
      <div>
        <Typography variant="h4" gutterBottom sx={styles.sectionHeader}>
          {i18n.libraryName()}
        </Typography>
        {this.displayNameInput()}
        <Typography variant="h4" gutterBottom sx={styles.sectionHeader}>
          {i18n.description()}
        </Typography>
        {this.displayDescription()}
        <Typography variant="h4" gutterBottom sx={styles.sectionHeader}>
          {i18n.catProcedures()}
        </Typography>
        <Checkbox
          name="selectAllFunctions"
          label={i18n.selectAllFunctions()}
          size="l"
          textThickness="thick"
          checked={this.allFunctionsSelected()}
          onChange={this.toggleAllFunctionsSelected}
        />
        {this.displayFunctions()}
        <Typography variant="body3" component="div">
          {i18n.libraryFunctionRequirements()}
        </Typography>
        <div style={{position: 'relative'}}>
          <MuiButton
            id="ui-test-publish-library"
            variant="contained"
            color="primary"
            onClick={this.validateAndPublish}
            sx={{marginTop: '20px'}}
          >
            {alreadyPublished ? i18n.update() : i18n.publish()}
          </MuiButton>
          {onShareTeacherLibrary && (
            <MuiButton
              id="ui-test-manage-libraries"
              variant="outlined"
              color="secondary"
              onClick={onShareTeacherLibrary}
              sx={{marginTop: '20px', marginLeft: '10px'}}
            >
              {i18n.manageLibraries()}
            </MuiButton>
          )}
          {alreadyPublished && (
            <MuiButton
              id="ui-test-unpublish-library"
              variant="contained"
              color="error"
              onClick={this.unpublish}
              sx={{marginTop: '20px', position: 'absolute', right: 0}}
            >
              {i18n.unpublish()}
            </MuiButton>
          )}
        </div>
        {this.displayError()}
      </div>
    );
  }
}

const styles = {
  sectionHeader: {
    marginTop: '24px',
  },
  functionBlock: {
    margin: '10px 10px 10px 0',
  },
  textInput: {
    fontSize: 14,
    padding: 6,
    color: 'var(--text-neutral-secondary)',
  },
  description: {
    width: '98%',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: '1rem',
    padding: '0.5rem 0.75rem',
    color: 'var(--text-neutral-primary)',
    backgroundColor: 'var(--background-neutral-primary)',
    border: '1px solid var(--borders-neutral-solid)',
    borderRadius: '0.25rem',
  },
};
