/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import libraryParser from './libraryParser';
import i18n from '@cdo/locale';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import {Heading1, Heading2} from '@cdo/apps/lib/ui/Headings';
import annotationList from '@cdo/apps/acemode/annotationList';
import Spinner from '../../pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

const styles = {
  alert: {
    color: color.red,
    width: '90%',
    paddingTop: 8
  },
  libraryBoundary: {
    padding: 10,
    width: '90%'
  },
  largerCheckbox: {
    width: 20,
    height: 20,
    marginLeft: 0,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10
  },
  functionItem: {
    marginBottom: 20
  },
  textarea: {
    width: 400
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  copy: {
    cursor: 'copy',
    width: 300,
    height: 25
  },
  button: {
    marginLeft: 10,
    marginRight: 10
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
  LOADING: 'loading',
  DONE_LOADING: 'done_loading',
  PUBLISHED: 'published',
  ERROR_PUBLISH: 'error_publish',
  CODE_ERROR: 'code_error',
  NO_FUNCTIONS: 'no_functions',
  INVALID_INPUT: 'invalid_input'
};

class LibraryCreationDialog extends React.Component {
  static propTypes = {
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    clientApi: PropTypes.object.isRequired
  };

  state = {
    librarySource: '',
    sourceFunctionList: [],
    publishState: PublishState.LOADING,
    libraryName: '',
    libraryDescription: '',
    canPublish: false,
    selectedFunctions: {}
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dialogIsOpen === false && this.props.dialogIsOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    var error = annotationList.getJSLintAnnotations().find(annotation => {
      return annotation.type === 'error';
    });
    if (error) {
      this.setState({publishState: PublishState.CODE_ERROR});
      return;
    }

    dashboard.project.getUpdatedSourceAndHtml_(response => {
      let functionsList = libraryParser.getFunctions(response.source);
      if (!functionsList || functionsList.length === 0) {
        this.setState({publishState: PublishState.NO_FUNCTIONS});
        return;
      }
      let librarySource = response.source;
      if (response.libraries) {
        response.libraries.forEach(library => {
          librarySource =
            libraryParser.createLibraryClosure(library) + librarySource;
        });
      }
      this.setState({
        libraryName: libraryParser.suggestName(
          dashboard.project.getLevelName()
        ),
        librarySource: librarySource,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: functionsList
      });
    });
  };

  handleClose = () => {
    this.setState({publishState: PublishState.LOADING});
    this.props.onClose();
  };

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  publish = () => {
    let {
      librarySource,
      libraryName,
      libraryDescription,
      selectedFunctions,
      sourceFunctionList
    } = this.state;
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

    // TODO: Display final version of error and success messages to the user.
    this.props.clientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);
        this.setState({publishState: PublishState.ERROR_PUBLISH});
      },
      () => {
        this.setState({publishState: PublishState.PUBLISHED});
      }
    );
    dashboard.project.setLibraryName(this.state.libraryName);
    dashboard.project.setLibraryDescription(libraryDescription);
  };

  displayError = errorMessage => {
    return <div>{errorMessage}</div>;
  };

  displayLoadingState = () => {
    return (
      <div style={styles.centerContent}>
        <Spinner />
      </div>
    );
  };

  setLibraryName = event => {
    let sanitizedName = libraryParser.sanitizeName(event.target.value);
    if (sanitizedName === this.state.libraryName) {
      return;
    }
    this.setState({libraryName: sanitizedName});
  };

  displaySuccess = () => {
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {this.state.libraryName}
        </Heading2>
        <div>
          <p>{i18n.libraryPublishExplanation()}</p>
          <div style={styles.centerContent}>
            <input
              type="text"
              ref={channelId => (this.channelId = channelId)}
              onClick={event => event.target.select()}
              readOnly="true"
              value={dashboard.project.getCurrentId()}
              style={styles.copy}
            />
            <Button
              onClick={this.copyChannelId}
              text={i18n.copyId()}
              style={styles.button}
            />
          </div>
        </div>
      </div>
    );
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
      this.setState({publishState: PublishState.DONE_LOADING});
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
        onChange={event =>
          this.setState({libraryDescription: event.target.value})
        }
        onBlur={this.resetErrorMessage}
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
    return this.state.sourceFunctionList.map(sourceFunction => {
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

  displayAlert = () => {
    let errorMessage;
    if (this.state.publishState === PublishState.INVALID_INPUT) {
      errorMessage = i18n.libraryPublishInvalid();
    }
    if (this.state.publishState === PublishState.ERROR_PUBLISH) {
      errorMessage = i18n.libraryPublishFail();
    }
    return (
      <div>
        <p style={styles.alert}>{errorMessage}</p>
      </div>
    );
  };

  displayContent = () => {
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
        {this.displayAlert()}
      </div>
    );
  };

  render() {
    let bodyContent;
    switch (this.state.publishState) {
      case PublishState.LOADING:
        bodyContent = this.displayLoadingState();
        break;
      case PublishState.PUBLISHED:
        bodyContent = this.displaySuccess();
        break;
      case PublishState.CODE_ERROR:
        bodyContent = this.displayError(i18n.libraryCodeError());
        break;
      case PublishState.NO_FUNCTIONS:
        bodyContent = this.displayError(i18n.libraryNoFunctonsError());
        break;
      default:
        bodyContent = this.displayContent();
    }
    return (
      <Dialog
        isOpen={this.props.dialogIsOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
      >
        <Body>
          <PadAndCenter>
            <div style={styles.libraryBoundary}>
              <Heading1>{i18n.libraryExportTitle()}</Heading1>
              {bodyContent}
            </div>
          </PadAndCenter>
        </Body>
      </Dialog>
    );
  }
}

export const UnconnectedLibraryCreationDialog = LibraryCreationDialog;

export default connect(
  state => ({
    dialogIsOpen: state.shareDialog.libraryDialogIsOpen
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryCreationDialog());
    }
  })
)(LibraryCreationDialog);
