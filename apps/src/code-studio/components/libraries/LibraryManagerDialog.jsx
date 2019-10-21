/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';

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

  addLibrary = () => {
    let libraryClient = new LibraryClientApi(this.state.importLibraryId);
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

  removeLibrary = libraryName => {
    dashboard.project.setProjectLibraries(
      this.state.libraries.filter(library => {
        return library.name !== libraryName;
      })
    );
  };

  displayLibraries = () => {
    return this.state.libraries.map(library => {
      return (
        <div key={library.name}>
          <span>{library.name}</span>
          <button
            type="button"
            onClick={() => this.removeLibrary(library.name)}
          >
            Remove
          </button>
        </div>
      );
    });
  };

  render() {
    return (
      <Dialog isOpen={this.props.isOpen} onCancel={this.props.onClose}>
        <Body>
          {this.displayLibraries()}
          <input
            type="text"
            value={this.state.importLibraryId}
            onChange={this.setLibraryToImport}
          />
          <button onClick={this.addLibrary} type="button">
            Add Library
          </button>
        </Body>
      </Dialog>
    );
  }
}
