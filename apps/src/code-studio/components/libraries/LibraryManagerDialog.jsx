/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import Radium from 'radium';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryViewCode from '@cdo/apps/code-studio/components/libraries/LibraryViewCode';
import libraryParser from './libraryParser';
import color from '@cdo/apps/util/color';

const DEFAULT_MARGIN = 7;

const styles = {
  dialog: {
    padding: '0 15px'
  },
  linkBox: {
    cursor: 'auto',
    height: '32px',
    marginBottom: 0,
    flex: 1,
    maxWidth: 400
  },
  header: {
    textAlign: 'left',
    color: color.purple,
    fontSize: 24,
    marginTop: 20
  },
  libraryList: {
    maxHeight: '140px',
    overflowY: 'auto',
    borderBottom: `2px solid ${color.purple}`
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
    display: 'flex',
    alignItems: 'baseline'
  },
  add: {
    margin: DEFAULT_MARGIN,
    color: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    ':disabled': {
      color: color.light_gray,
      borderColor: color.light_gray,
      backgroundColor: color.lightest_gray
    }
  },
  hidden: {
    visibility: 'hidden'
  },
  error: {
    color: color.red,
    textAlign: 'left',
    margin: DEFAULT_MARGIN,
    minHeight: 30,
    whiteSpace: 'pre-wrap',
    lineHeight: 1
  }
};

export class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  state = {
    importLibraryId: '',
    libraries: [],
    classLibraries: [],
    cachedClassLibraries: [],
    viewingLibrary: {},
    isViewingCode: false,
    isLoading: false,
    error: null
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    this.setState({libraries: dashboard.project.getProjectLibraries() || []});

    let libraryClient = new LibraryClientApi();
    libraryClient.getClassLibraries(
      libraries => {
        this.setState(
          {classLibraries: libraries || []},
          this.mapUserNameToProjectLibraries
        );
      },
      error => {
        console.log('error: ' + error);
      }
    );
  };

  // Map userName from class libraries to project libraries so the author is displayed in the UI.
  // We only want users to see the author name for libraries from their classmates.
  mapUserNameToProjectLibraries = () => {
    const {libraries, classLibraries} = this.state;

    if (classLibraries.length === 0) {
      return;
    }

    const projectLibraries = [
      ...(libraries || dashboard.project.getProjectLibraries() || [])
    ];
    projectLibraries.forEach(projectLibrary => {
      const classLibrary = classLibraries.find(
        library => library.channel === projectLibrary.channelId
      );
      projectLibrary.userName = classLibrary && classLibrary.userName;
    });

    this.setState({libraries: projectLibraries});
  };

  setLibraryToImport = event => {
    this.setState({importLibraryId: event.target.value, error: null});
  };

  addLibraryToProject = libraryJson => {
    if (!libraryJson) {
      return;
    }

    dashboard.project.setProjectLibraries([
      ...this.state.libraries,
      libraryJson
    ]);
    this.setState({libraries: dashboard.project.getProjectLibraries()});
  };

  updateLibraryInProject = libraryJson => {
    if (!libraryJson) {
      return;
    }

    let libraries = [...this.state.libraries];
    const libraryIndex = libraries.findIndex(
      library => library.channelId === libraryJson.channelId
    );
    libraries[libraryIndex] = libraryJson;
    dashboard.project.setProjectLibraries(libraries);
    this.setState({libraries: dashboard.project.getProjectLibraries()});
  };

  addLibraryById = (libraryJson, error) => {
    if (error) {
      this.setState({
        error: i18n.libraryImportError(),
        isLoading: false
      });
    } else if (libraryJson) {
      this.addLibraryToProject(libraryJson);
    }
  };

  fetchLatestLibrary = (channelId, callback) => {
    let {cachedClassLibraries} = this.state;
    let cachedLibrary = cachedClassLibraries.find(
      library => library.channelId === channelId
    );
    if (cachedLibrary) {
      callback(cachedLibrary, null);
      return;
    }

    let libraryClient = new LibraryClientApi(channelId);
    const errorCallback = err => callback(null, err);

    libraryClient.fetchLatestVersionId(
      versionId =>
        // TODO: Check for naming collisions between libraries.
        libraryClient.fetchByVersion(
          versionId,
          data => {
            let updatedjson = libraryParser.prepareLibraryForImport(
              data,
              channelId,
              versionId
            );
            this.setState({
              cachedClassLibraries: [...cachedClassLibraries, updatedjson],
              isLoading: false
            });
            callback(updatedjson, null);
          },
          errorCallback
        ),
      errorCallback
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
    let {libraries} = this.state;
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
          onUpdate={channelId =>
            this.fetchLatestLibrary(channelId, this.updateLibraryInProject)
          }
          onRemove={this.removeLibrary}
          onViewCode={() => this.viewCode(library)}
        />
      );
    });
  };

  displayClassLibraries = () => {
    let {classLibraries} = this.state;
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
          onAdd={() =>
            this.fetchLatestLibrary(library.channel, this.addLibraryToProject)
          }
          onViewCode={() =>
            this.fetchLatestLibrary(library.channel, this.viewCode)
          }
        />
      );
    });
  };

  viewCode = library => {
    if (!library) {
      return;
    }

    this.setState({viewingLibrary: library, isViewingCode: true});
  };

  closeLibraryManager = () => {
    this.setState({cachedClassLibraries: []});
    this.props.onClose();
  };

  render() {
    let {isOpen} = this.props;
    let {isViewingCode, importLibraryId, viewingLibrary} = this.state;
    return (
      <div>
        <BaseDialog
          isOpen={isOpen}
          handleClose={this.closeLibraryManager}
          style={{...styles.dialog, ...(isViewingCode ? styles.hidden : {})}}
          useUpdatedStyles
        >
          <h1 style={styles.header}>{i18n.libraryManage()}</h1>
          <div style={styles.libraryList}>{this.displayProjectLibraries()}</div>
          <h1 style={styles.header}>{i18n.libraryClassImport()}</h1>
          <div style={styles.libraryList}>{this.displayClassLibraries()}</div>
          <h1 style={styles.header}>{i18n.libraryIdImport()}</h1>
          <div style={styles.inputParent}>
            <input
              style={styles.linkBox}
              type="text"
              value={importLibraryId}
              onChange={this.setLibraryToImport}
            />
            <button
              style={styles.add}
              onClick={() => {
                this.setState({isLoading: true});
                this.fetchLatestLibrary(importLibraryId, this.addLibraryById);
              }}
              type="button"
              disabled={!this.state.importLibraryId}
            >
              {this.state.isLoading && (
                <FontAwesome icon="spinner" className="fa-spin" />
              )}
              {!this.state.isLoading && i18n.add()}
            </button>
          </div>
          <div style={styles.error}>{this.state.error}</div>
        </BaseDialog>
        <LibraryViewCode
          isOpen={isViewingCode}
          onClose={() => this.setState({isViewingCode: false})}
          library={viewingLibrary}
        />
      </div>
    );
  }
}

export default Radium(LibraryManagerDialog);
