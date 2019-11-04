/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import libraryParser from './libraryParser';
import color from '@cdo/apps/util/color';

const DEFAULT_MARGIN = 7;

const styles = {
  linkBox: {
    cursor: 'auto',
    height: '32px',
    margin: DEFAULT_MARGIN,
    marginRight: 0,
    flex: 1
  },
  header: {
    textAlign: 'left',
    fontSize: 'x-large',
    color: color.purple,
    margin: DEFAULT_MARGIN,
    marginTop: 20
  },
  libraryList: {
    maxHeight: '140px',
    overflowY: 'auto'
  },
  message: {
    color: color.dark_charcoal,
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    overflow: 'hidden',
    lineHeight: '15px',
    whiteSpace: 'pre-wrap'
  },
  inputParent: {
    display: 'flex'
  },
  add: {
    margin: DEFAULT_MARGIN
  }
};

export default class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  state = {
    importLibraryId: '',
    libraries: [],
    classLibraries: []
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    let libraryClient = new LibraryClientApi();
    this.setState({libraries: dashboard.project.getProjectLibraries() || []});
    libraryClient.getClassLibraries(libraries => {
      this.setState({classLibraries: libraries});
    });
  };

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value});
  };

  importLibrary = (channelId, versionId) => {
    // TODO: Check for naming collisions between libraries.
    let libraryClient = new LibraryClientApi(channelId);
    libraryClient.fetchByVersion(
      versionId,
      data => {
        let updatedjson = libraryParser.prepareLibraryForImport(
          data,
          channelId,
          versionId
        );
        dashboard.project.setProjectLibraries([
          ...this.state.libraries,
          updatedjson
        ]);
        this.setState({libraries: dashboard.project.getProjectLibraries()});
      },
      error => {
        console.log('ERROR: ' + error);
      }
    );
  };

  addLibrary = channelId => {
    let libraryClient = new LibraryClientApi(channelId);
    libraryClient.fetchLatestVersionId(versionId =>
      this.importLibrary(channelId, versionId)
    );
  };

  removeLibrary = libraryName => {
    dashboard.project.setProjectLibraries(
      this.state.libraries.filter(library => {
        return library.name !== libraryName;
      })
    );
    this.setState({libraries: dashboard.project.getProjectLibraries()});
  };

  displayProjectLibraries = () => {
    let libraries = this.state.libraries;
    if (!Array.isArray(libraries) || !libraries.length) {
      return (
        <div style={styles.message}>
          You have no libraries in your project. Try adding one from your class
          list or from an ID.
        </div>
      );
    }
    return libraries.map(library => {
      return (
        <LibraryListItem
          key={library.name}
          library={library}
          onRefresh={undefined}
          onRemove={this.removeLibrary}
        />
      );
    });
  };

  displayClassLibraries = () => {
    let classLibraries = this.state.classLibraries;
    if (!Array.isArray(classLibraries) || !classLibraries.length) {
      return (
        <div style={styles.message}>
          No one in your class has published a library. Try adding one from an
          ID.
        </div>
      );
    }
    return classLibraries.map(library => {
      return (
        <LibraryListItem
          key={library.channel}
          library={library}
          onAdd={() => this.addLibrary(library.channel)}
        />
      );
    });
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onClose}
        useUpdatedStyles
      >
        <div style={styles.header}>Manage libraries in this project</div>
        <div style={styles.libraryList}>{this.displayProjectLibraries()}</div>
        <div style={styles.header}>Import library from my class</div>
        <div style={styles.libraryList}>{this.displayClassLibraries()}</div>
        <div style={styles.header}>Import library from ID</div>
        <div style={styles.inputParent}>
          <input
            style={styles.linkBox}
            type="text"
            value={this.state.importLibraryId}
            onChange={this.setLibraryToImport}
          />
          <button
            style={styles.add}
            onClick={() => this.addLibrary(this.state.importLibraryId)}
            type="button"
          >
            Add
          </button>
        </div>
      </BaseDialog>
    );
  }
}
