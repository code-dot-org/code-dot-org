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
import Spinner from '../../pd/components/spinner';
import Button from '@cdo/apps/templates/Button';

const styles = {
  alert: {
    color: 'red'
  },
  libraryBoundary: {
    padding: 10
  },
  largerCheckbox: {
    width: 20,
    height: 20,
    margin: 10
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
  }
};

function select(event) {
  event.target.select();
}

/**
 * @readonly
 * @enum {string}
 */
export const LoadingState = {
  LOADING: 'loading',
  DONE_LOADING: 'done_loading',
  PUBLISHED: 'published'
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
    loadingState: LoadingState.LOADING,
    libraryName: '',
    canPublish: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dialogIsOpen === false && this.props.dialogIsOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    dashboard.project.getUpdatedSourceAndHtml_(response => {
      this.setState({
        libraryName: libraryParser.sanitizeName(
          dashboard.project.getLevelName()
        ),
        librarySource: response.source,
        loadingState: LoadingState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(response.source)
      });
    });
  };

  handleClose = () => {
    this.setState({loadingState: LoadingState.LOADING});
    this.props.onClose();
  };

  copyChannelId = () => {
    let channelId = document.getElementById('library-sharing');
    channelId.select();
    document.execCommand('copy');
  };

  publish = event => {
    event.preventDefault();
    let formElements = this.formElements.elements;
    let selectedFunctionList = [];
    let libraryDescription = '';
    [...formElements].forEach(element => {
      if (element.type === 'checkbox' && element.checked) {
        selectedFunctionList.push(this.state.sourceFunctionList[element.value]);
      }
      if (element.type === 'textarea') {
        libraryDescription = element.value;
      }
    });
    let libraryJson = libraryParser.createLibraryJson(
      this.state.librarySource,
      selectedFunctionList,
      this.state.libraryName,
      libraryDescription
    );

    // TODO: Display final version of error and success messages to the user.
    this.props.clientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);
      },
      () => {
        this.setState({loadingState: LoadingState.PUBLISHED});
      }
    );
    dashboard.project.setLibraryName(this.state.libraryName);
    dashboard.project.setLibraryDescription(libraryDescription);
  };

  validateInput = () => {
    // Check if any of the checkboxes are checked
    // If this changes the publishable state, update
    let formElements = this.formElements.elements;
    let isChecked = false;
    [...formElements].forEach(element => {
      if (element.type === 'checkbox' && element.checked) {
        isChecked = true;
      }
    });
    if (isChecked !== this.state.canPublish) {
      this.setState({canPublish: isChecked});
    }
  };

  displayLoadingState = () => {
    return (
      <div style={styles.centerContent}>
        <Spinner />
      </div>
    );
  };

  displayFunctions = () => {
    let keyIndex = 0;
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryName()}</b>
          {this.state.libraryName}
        </Heading2>
        <form
          ref={formElements => {
            this.formElements = formElements;
          }}
          onSubmit={this.publish}
        >
          <textarea
            required
            name="description"
            rows="2"
            cols="200"
            style={styles.textarea}
            placeholder="Write a description of your library"
          />
          {this.state.sourceFunctionList.map(sourceFunction => {
            let name = sourceFunction.functionName;
            let comment = sourceFunction.comment;
            return (
              <div key={keyIndex} style={styles.functionItem}>
                <input
                  type="checkbox"
                  style={styles.largerCheckbox}
                  disabled={comment.length === 0}
                  onClick={this.validateInput}
                  value={keyIndex++}
                />
                {name}
                <br />
                {comment.length === 0 && (
                  <p style={styles.alert}>
                    {i18n.libraryExportNoCommentError()}
                  </p>
                )}
                <pre>{comment}</pre>
              </div>
            );
          })}
          <div>
            <input
              className="btn btn-primary"
              type="submit"
              value={i18n.publish()}
              disabled={!this.state.canPublish}
            />
            {this.state.loadingState === LoadingState.ERROR_PUBLISH && (
              <p id="error-alert" style={styles.alert}>
                {i18n.libraryPublishFail()}
              </p>
            )}
          </div>
        </form>
      </div>
    );
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
              id="library-sharing"
              onClick={select}
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

  render() {
    let bodyContent;
    switch (this.state.loadingState) {
      case LoadingState.LOADING:
        bodyContent = this.displayLoadingState();
        break;
      case LoadingState.PUBLISHED:
        bodyContent = this.displaySuccess();
        break;
      default:
        bodyContent = this.displayFunctions();
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
