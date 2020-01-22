/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import libraryParser from './libraryParser';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {Heading2} from '@cdo/apps/lib/ui/Headings';
import Button from '@cdo/apps/templates/Button';

const styles = {
  alert: {
    color: color.red,
    width: '90%',
    paddingTop: 8
  },
  largerCheckbox: {
    width: 20,
    height: 20,
    marginLeft: 0,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10
  },
  info: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  textInput: {
    fontSize: 14,
    padding: 6,
    color: color.dimgray
  },
  description: {
    width: '98%',
    resize: 'vertical'
  }
};

/**
 * @readonly
 * @enum {string}
 */
export const PublishState = {
  DEFAULT: 'default',
  ERROR_PUBLISH: 'error_publish',
  INVALID_INPUT: 'invalid_input'
};

/**
 * An interactive page for a dialog that can be used to publish or unpublish
 * a library from a source project.
 */
export default class LibraryPublisher extends React.Component {
  static propTypes = {
    onPublishSuccess: PropTypes.func.isRequired,
    libraryDetails: PropTypes.object.isRequired,
    libraryClientApi: PropTypes.object.isRequired
  };

  state = {
    publishState: PublishState.DEFAULT,
    libraryName: libraryParser.suggestName(
      this.props.libraryDetails.libraryName
    ),
    libraryDescription: '',
    selectedFunctions: {}
  };

  setLibraryName = event => {
    let sanitizedName = libraryParser.sanitizeName(event.target.value);
    if (sanitizedName === this.state.libraryName) {
      return;
    }
    this.setState({libraryName: sanitizedName});
  };

  publish = () => {
    const {libraryDescription, libraryName, selectedFunctions} = this.state;
    const {librarySource, sourceFunctionList} = this.props.libraryDetails;
    const {libraryClientApi, onPublishSuccess} = this.props;
    let functionsToPublish = sourceFunctionList.filter(sourceFunction => {
      return selectedFunctions[sourceFunction.functionName];
    });

    if (!(libraryDescription && functionsToPublish.length > 0)) {
      this.setState({publishState: PublishState.INVALID_INPUT});
      return;
    }

    let libraryJson = libraryParser.createLibraryJson(
      librarySource,
      functionsToPublish,
      libraryName,
      libraryDescription
    );

    libraryClientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);
        this.setState({publishState: PublishState.ERROR_PUBLISH});
      },
      () => {
        onPublishSuccess(libraryName);
      }
    );
    dashboard.project.setLibraryName(libraryName);
    dashboard.project.setLibraryDescription(libraryDescription);
  };

  displayNameInput = () => {
    return (
      <div>
        <input
          style={styles.textInput}
          type="text"
          value={this.state.libraryName}
          onChange={this.setLibraryName}
          onBlur={event =>
            this.setState({
              libraryName: libraryParser.suggestName(event.target.value)
            })
          }
        />
        <div style={styles.info}>{i18n.libraryNameRequirements()}</div>
      </div>
    );
  };

  resetErrorMessage = () => {
    if (
      this.state.libraryDescription &&
      Object.values(this.state.selectedFunctions).find(value => value) &&
      this.state.publishState === PublishState.INVALID_INPUT
    ) {
      this.setState({publishState: PublishState.DEFAULT});
    }
  };

  displayDescription = () => {
    return (
      <textarea
        rows="2"
        cols="200"
        style={{...styles.textInput, ...styles.description}}
        placeholder={i18n.libraryDescriptionPlaceholder()}
        value={this.state.libraryDescription}
        onChange={event => {
          this.setState(
            {libraryDescription: event.target.value},
            this.resetErrorMessage
          );
        }}
      />
    );
  };

  boxChecked = name => () => {
    this.setState(state => {
      state.selectedFunctions[name] = !state.selectedFunctions[name];
      return state;
    }, this.resetErrorMessage);
  };

  displayFunctions = () => {
    return this.props.libraryDetails.sourceFunctionList.map(sourceFunction => {
      let name = sourceFunction.functionName;
      let comment = sourceFunction.comment;
      return (
        <div key={name}>
          <input
            style={styles.largerCheckbox}
            type="checkbox"
            disabled={comment.length === 0}
            name={name}
            checked={this.state.selectedFunctions[name] || false}
            onChange={this.boxChecked(name)}
          />
          <span>{name}</span>
          <br />
          {comment.length === 0 && (
            <p style={styles.alert}>{i18n.libraryExportNoCommentError()}</p>
          )}
          <pre style={styles.textInput}>{comment}</pre>
        </div>
      );
    });
  };

  displayError = () => {
    let errorMessage;
    if (this.state.publishState === PublishState.INVALID_INPUT) {
      errorMessage = i18n.libraryPublishInvalid();
    }
    if (this.state.publishState === PublishState.ERROR_PUBLISH) {
      errorMessage = i18n.libraryPublishFail();
    }
    return (
      errorMessage && (
        <div>
          <p style={styles.alert}>{errorMessage}</p>
        </div>
      )
    );
  };

  render() {
    return (
      <div>
        <Heading2>{i18n.libraryName()}</Heading2>
        {this.displayNameInput()}
        <Heading2>{i18n.description()}</Heading2>
        {this.displayDescription()}
        <Heading2>{i18n.catProcedures()}</Heading2>
        {this.displayFunctions()}
        <Button
          style={{marginLeft: 0, marginTop: 20}}
          onClick={this.publish}
          text={i18n.publish()}
        />
        {this.displayError()}
      </div>
    );
  }
}
