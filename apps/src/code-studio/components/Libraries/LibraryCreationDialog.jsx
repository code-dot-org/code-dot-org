import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../../../templates/BaseDialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from './libraryCreationRedux';
import libraryParser from './libraryParser';
import LibraryClientApi from './LibraryClientApi';
import i18n from '@cdo/locale';

class LibraryCreationDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    librarySource: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired
  };

  state = {
    clientApi: new LibraryClientApi(this.props.channelId),
    selectedFunctionList: [],
    libraryName: ''
  };

  getFunctions = () => {
    // TODO: Ask the user to check off which functions to include
    return libraryParser.getFunctions(this.props.librarySource);
  };

  getLibraryName = () => {
    // TODO: Display library name to the user. They can change the name of their library by changing the name of their project
    return libraryParser.sanitizeName(this.props.projectName);
  };

  publish = () => {
    // Note: This setState is only here because user interactions are not implemented yet.
    this.setState(
      {
        selectedFunctionList: this.getFunctions(),
        libraryName: this.getLibraryName()
      },
      () => {
        let libraryJson = libraryParser.createLibraryJson(
          this.props.librarySource,
          this.state.selectedFunctionList,
          this.state.libraryName
        );
        // TODO: Display final version of error and success messages to the user.
        this.state.clientApi.publish(
          libraryJson,
          error => {
            console.warn(`Error publishing library: ${error}`);
          },
          data => {
            console.log(
              `Successfully published library. VersionID: ${data.versionId}`
            );
          }
        );
      }
    );
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onClose}
        useUpdatedStyles
      >
        <button type="button" onClick={this.publish}>
          {i18n.publish()}
        </button>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: state.libraryCreation.isOpen,
    librarySource: state.libraryCreation.librarySource,
    projectName: state.libraryCreation.libraryName
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryCreationDialog());
    }
  })
)(LibraryCreationDialog);
