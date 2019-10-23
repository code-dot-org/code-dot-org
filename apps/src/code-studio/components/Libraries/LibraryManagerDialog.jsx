/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import LibraryClientApi from '@cdo/apps/code-studio/components/Libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/Libraries/LibraryListItem';
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
    maxHeight: '110px',
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

  componentDidMount = () => {
    let libraryClient = new LibraryClientApi();
    this.setState({libraries: dashboard.project.getProjectLibraries() || []});
    this.setState({classLibraries: libraryClient.getClassLibraries() || []});
  };

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value});
  };

  addLibrary = event => {
    let libraryToImport = event.target.value
      ? event.target.value
      : this.state.importLibraryId;
    let libraryClient = new LibraryClientApi(libraryToImport);
    libraryClient.getLatest(
      data => {
        dashboard.project.setProjectLibraries([
          ...this.state.libraries,
          JSON.parse(data)
        ]);
      },
      error => {
        console.log('ERROR: ' + error);
      }
    );
  };

  refreshLibrary = libraryName => {
    console.log('refreshed ' + libraryName + '!');
  };

  removeLibrary = libraryName => {
    dashboard.project.setProjectLibraries(
      this.state.libraries.filter(library => {
        return library.name !== libraryName;
      })
    );
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
          onRefresh={this.refreshLibrary}
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
          key={library.name}
          library={library}
          onAdd={this.addLibrary}
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
          <button style={styles.add} onClick={this.addLibrary} type="button">
            Add
          </button>
        </div>
      </BaseDialog>
    );
  }
}
