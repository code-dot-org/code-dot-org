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

const styles = {
  scrollbar: {
    overflowY: 'scroll'
  }
};

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

  tempSubmit = () => {
    console.log('submit');
  };

  displayFunctions = () => {
    if (!this.state.loadingFinished) {
      return <div>Loading...</div>;
    }
    //Todo Adjust rows and cols to respond to changing size of window
    return (
      <div>
        <h2>{this.state.libraryName}</h2>
        <form onSubmit={this.tempSubmit}>
          <textarea
            name="description"
            rows="2"
            cols="200"
            placeholder="Write a description of your library"
          />
          <div>
            {this.state.selectedFunctionList.map(selectedFunction => {
              let name = selectedFunction.functionName;
              return (
                <div>
                  <input type="checkbox" key={name} /> {name} <br />
                </div>
              );
            })}
          </div>
        </form>
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
          <div style={styles.scrollbar}>{this.displayFunctions()}</div>
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
