/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import libraryParser from './libraryParser';
import LibraryClientApi from './LibraryClientApi';
import i18n from '@cdo/locale';
import Button from '../../../templates/Button';
import DialogFooter from '../../../templates/teacherDashboard/DialogFooter';

class LibraryCreationDialog extends React.Component {
  static propTypes = {
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    channelId: PropTypes.string.isRequired
  };

  state = {
    clientApi: new LibraryClientApi(this.props.channelId),
    librarySource: '',
    selectedFunctionList: [],
    loadingFinished: false,
    libraryName: ''
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
          dashboard.project.getCurrentName()
        ),
        librarySource: response.source,
        loadingFinished: true,
        selectedFunctionList: libraryParser.getFunctions(response.source)
      });
    });
  };

  handleClose = () => {
    this.setState({loadingFinished: false});
    this.props.onClose();
  };

  publish = () => {
    let libraryJson = libraryParser.createLibraryJson(
      this.state.librarySource,
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
  };

  displayFunctions = () => {
    if (!this.state.loadingFinished) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div>{this.state.libraryName}</div>
        {this.state.selectedFunctionList.map(selectedFunction => {
          let name = selectedFunction.functionName;
          return <div key={name}>{name}</div>;
        })}
      </div>
    );
  };

  render() {
    return (
      <Dialog
        title="Publish Functions as a Library"
        isOpen={this.props.dialogIsOpen}
        handleClose={this.handleClose}
      >
        <Body>
          {this.displayFunctions()}
          <DialogFooter rightAlign>
            <Button
              onClick={this.publish}
              text={i18n.publish()}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </Body>
      </Dialog>
    );
  }
}

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
