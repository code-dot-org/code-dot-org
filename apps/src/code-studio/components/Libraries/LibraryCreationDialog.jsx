/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import libraryParser from './libraryParser';
import LibraryClientApi from './LibraryClientApi';
import i18n from '@cdo/locale';
import PadAndCenter from '../../../templates/teacherDashboard/PadAndCenter';
import {Heading1, Heading2} from '../../../lib/ui/Headings';

const styles = {
  alert: {
    color: 'red'
  },
  libraryBoundary: {
    padding: 10
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
    this.publish();
  };

  displayFunctions = () => {
    if (!this.state.loadingFinished) {
      return <div>Loading...</div>;
    }
    let keyIndex = 0;
    //Todo Adjust rows and cols to respond to changing size of window
    return (
      <div>
        <Heading2>{this.state.libraryName}</Heading2>
        <form onSubmit={this.tempSubmit}>
          <textarea
            name="description"
            rows="2"
            cols="200"
            placeholder="Write a description of your library"
          />
          {this.state.selectedFunctionList.map(selectedFunction => {
            let name = selectedFunction.functionName;
            let comment = selectedFunction.comment;
            return (
              <div key={keyIndex++}>
                <input type="checkbox" disabled={comment.length === 0} />
                {name}
                <br />
                {comment.length === 0 && (
                  <p style={styles.alert}>
                    You must add a comment describing this function before you
                    can export it.
                  </p>
                )}
                <pre>{comment}</pre>
              </div>
            );
          })}
          <input
            type="submit"
            value={i18n.publish()}
            disabled={!this.state.canPublish}
          />
        </form>
      </div>
    );
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.dialogIsOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
      >
        <Body>
          <PadAndCenter>
            <div style={styles.libraryBoundary}>
              <Heading1>Functions as a Library</Heading1>
              {this.displayFunctions()}
            </div>
          </PadAndCenter>
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
