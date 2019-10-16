/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import LibraryClientApi from '@cdo/apps/code-studio/components/Libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/Libraries/LibraryListItem';
import color from '@cdo/apps/util/color';

const styles = {
  linkBox: {
    cursor: 'auto',
    width: '600px',
    height: '32px',
    marginBottom: 0
  },
  header: {
    textAlign: 'left',
    fontSize: 'x-large',
    color: color.purple,
    margin: 7,
    marginTop: 20
  }
};

export default class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  state = {
    importLibraryId: '',
    libraries: []
  };

  componentDidMount = () => {
    this.setState({libraries: dashboard.project.getProjectLibraries() || []});
  };

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value});
  };

  addLibrary = library => {
    let libraryToImport = library ? library : this.state.importLibraryId;
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
    return this.state.libraries.map(library => {
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
    let classLibraries = this.state.libraries;
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
        {this.displayProjectLibraries()}
        <div style={styles.header}>Import library from my class</div>
        {this.displayClassLibraries()}
        <div style={styles.header}>Import library from ID</div>
        <input
          style={styles.linkBox}
          type="text"
          value={this.state.importLibraryId}
          onChange={this.setLibraryToImport}
        />
        <button onClick={this.addLibrary} type="button">
          Add
        </button>
      </BaseDialog>
    );
  }
}
