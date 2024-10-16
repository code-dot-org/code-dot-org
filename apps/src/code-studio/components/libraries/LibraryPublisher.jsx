import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {Heading2} from '@cdo/apps/legacySharedComponents/Headings';
import color from '@cdo/apps/util/color';
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
        <input
          style={styles.textInput}
          type="text"
          value={libraryName}
          onChange={this.setLibraryName}
          onBlur={event =>
            this.setState({
              libraryName: libraryParser.suggestName(event.target.value),
            })
          }
        />
        <div style={styles.info}>{i18n.libraryNameRequirements()}</div>
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
        style={{...styles.textInput, ...styles.description}}
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
      const functionId = _.uniqueId(`${functionName}-`);

      return (
        <div key={functionName}>
          <div style={styles.functionSelector}>
            <input
              style={styles.largerCheckbox}
              type="checkbox"
              id={functionId}
              disabled={!this.isFunctionValid(sourceFunction)}
              name={functionName}
              checked={checked}
              onChange={() => this.boxChecked(sourceFunction)}
            />
            <label htmlFor={functionId} style={styles.functionLabel}>
              {functionName}
            </label>
          </div>
          {!this.hasComment(sourceFunction) && (
            <p style={styles.alert}>{i18n.libraryExportNoCommentError()}</p>
          )}
          {this.duplicateFunction(sourceFunction) && (
            <p style={styles.alert}>
              {i18n.libraryExportDuplicationFunctionError()}
            </p>
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
        <p style={styles.alert}>{errorMessage}</p>
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
    const selectAllCheckboxId = _.uniqueId('func-select-all-');

    return (
      <div>
        <Heading2>{i18n.libraryName()}</Heading2>
        {this.displayNameInput()}
        <Heading2>{i18n.description()}</Heading2>
        {this.displayDescription()}
        <Heading2>{i18n.catProcedures()}</Heading2>
        <div style={styles.functionSelector}>
          <input
            style={styles.largerCheckbox}
            type="checkbox"
            id={selectAllCheckboxId}
            checked={this.allFunctionsSelected()}
            onChange={this.toggleAllFunctionsSelected}
          />
          <label
            htmlFor={selectAllCheckboxId}
            style={styles.selectAllFunctionsLabel}
          >
            {i18n.selectAllFunctions()}
          </label>
        </div>
        {this.displayFunctions()}
        <div style={styles.info}>{i18n.libraryFunctionRequirements()}</div>
        <div style={{position: 'relative'}}>
          <Button
            id="ui-test-publish-library"
            style={styles.button}
            onClick={this.validateAndPublish}
            text={alreadyPublished ? i18n.update() : i18n.publish()}
          />
          {onShareTeacherLibrary && (
            <Button
              id="ui-test-manage-libraries"
              style={{...styles.button, marginLeft: 10}}
              onClick={onShareTeacherLibrary}
              text={i18n.manageLibraries()}
              color={Button.ButtonColor.gray}
            />
          )}
          {alreadyPublished && (
            <Button
              id="ui-test-unpublish-library"
              style={{...styles.button, ...styles.unpublishButton}}
              onClick={this.unpublish}
              text={i18n.unpublish()}
              color={Button.ButtonColor.red}
            />
          )}
        </div>
        {this.displayError()}
      </div>
    );
  }
}

const styles = {
  alert: {
    color: color.red,
    width: '90%',
    paddingTop: 8,
    fontStyle: 'italic',
  },
  functionSelector: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 10px 10px 0',
  },
  largerCheckbox: {
    width: 20,
    height: 20,
  },
  selectAllFunctionsLabel: {
    margin: 0,
    fontSize: 20,
    ...fontConstants['main-font-semi-bold'],
  },
  functionLabel: {
    margin: 0,
    fontSize: 20,
  },
  info: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 1.2,
  },
  textInput: {
    fontSize: 14,
    padding: 6,
    color: color.dimgray,
  },
  description: {
    width: '98%',
    resize: 'vertical',
  },
  unpublishButton: {
    right: 0,
    position: 'absolute',
  },
  button: {
    margin: 0,
    marginTop: 20,
  },
};
