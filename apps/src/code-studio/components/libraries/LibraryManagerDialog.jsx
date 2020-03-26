/*globals dashboard*/
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryViewCode from '@cdo/apps/code-studio/components/libraries/LibraryViewCode';
import LibraryIdImporter from '@cdo/apps/code-studio/components/libraries/LibraryIdImporter';
import libraryParser from './libraryParser';
import color from '@cdo/apps/util/color';
import {
  DEFAULT_MARGIN,
  libraryStyles
} from '@cdo/apps/code-studio/components/libraries/styles';

const styles = {
  dialog: {
    padding: '0 15px'
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
  hidden: {
    visibility: 'hidden'
  }
};

// Map userName from class libraries to project libraries so the author is displayed in the UI.
// We only want users to see the author name for libraries from their classmates.
export const mapUserNameToProjectLibraries = (
  projectLibraries,
  classLibraries
) => {
  if (classLibraries.length === 0) {
    return projectLibraries;
  }

  projectLibraries.forEach(projectLibrary => {
    const classLibrary = classLibraries.find(
      library => library.channel === projectLibrary.channelId
    );
    projectLibrary.userName = classLibrary && classLibrary.userName;
  });

  return projectLibraries;
};

export default class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  state = {
    importLibraryId: '',
    projectLibraries: [],
    classLibraries: [],
    cachedClassLibraries: [],
    viewingLibrary: {},
    isViewingCode: false,
    isLoading: false,
    loadLibraryErrored: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    const libraries = dashboard.project.getProjectLibraries() || [];
    this.setState({projectLibraries: libraries});

    let libraryClient = new LibraryClientApi();
    libraryClient.getClassLibraries(
      classLibraries => {
        const projectLibraries = mapUserNameToProjectLibraries(
          libraries,
          classLibraries
        );
        this.setState({
          classLibraries,
          projectLibraries: projectLibraries
        });
      },
      error => {
        console.log('error: ' + error);
      }
    );
  };

  addLibraryToProject = libraryJson => {
    const {projectLibraries} = this.state;
    if (!libraryJson) {
      return;
    }

    dashboard.project.setProjectLibraries([...projectLibraries, libraryJson]);
    this.setState({projectLibraries: dashboard.project.getProjectLibraries()});
  };

  updateLibraryInProject = libraryJson => {
    const {projectLibraries} = this.state;
    if (!libraryJson) {
      return;
    }

    let libraries = [...projectLibraries];
    const libraryIndex = libraries.findIndex(
      library => library.channelId === libraryJson.channelId
    );
    libraries[libraryIndex] = libraryJson;
    dashboard.project.setProjectLibraries(libraries);
    this.setState({libraries: dashboard.project.getProjectLibraries()});
  };

  addLibraryById = (libraryJson, error) => {
    if (error) {
      this.setState({isLoading: false, loadLibraryErrored: true});
    } else if (libraryJson) {
      this.addLibraryToProject(libraryJson);
    }
  };

  fetchLatestLibrary = (channelId, callback) => {
    this.setState({isLoading: true, loadLibraryErrored: false});
    const {cachedClassLibraries} = this.state;
    const cachedLibrary = cachedClassLibraries.find(
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
              cachedClassLibraries: [...cachedClassLibraries, updatedjson]
            });
            callback(updatedjson, null);
          },
          errorCallback
        ),
      errorCallback
    );
  };

  removeLibrary = libraryName => {
    const {projectLibraries} = this.state;
    dashboard.project.setProjectLibraries(
      projectLibraries.filter(library => {
        return library.name !== libraryName;
      })
    );
    this.setState({projectLibraries: dashboard.project.getProjectLibraries()});
  };

  displayProjectLibraries = () => {
    const {projectLibraries} = this.state;
    if (!Array.isArray(projectLibraries) || !projectLibraries.length) {
      return <div style={styles.message}>{i18n.noLibrariesInProject()}</div>;
    }
    return projectLibraries.map(library => {
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
    const {classLibraries} = this.state;
    if (!Array.isArray(classLibraries) || !classLibraries.length) {
      return <div style={styles.message}>{i18n.noLibrariesInClass()}</div>;
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
    const {isOpen} = this.props;
    const {
      isViewingCode,
      viewingLibrary,
      isLoading,
      loadLibraryErrored
    } = this.state;
    return (
      <div>
        <BaseDialog
          isOpen={isOpen}
          handleClose={this.closeLibraryManager}
          style={{...styles.dialog, ...(isViewingCode ? styles.hidden : {})}}
          useUpdatedStyles
        >
          <h1 style={libraryStyles.header}>{i18n.libraryManage()}</h1>
          <div style={styles.libraryList}>{this.displayProjectLibraries()}</div>
          <h1 style={libraryStyles.header}>{i18n.libraryClassImport()}</h1>
          <div style={styles.libraryList}>{this.displayClassLibraries()}</div>
          <LibraryIdImporter
            isLoading={isLoading}
            loadLibraryErrored={loadLibraryErrored}
            addLibraryById={id =>
              this.fetchLatestLibrary(id, this.addLibraryById)
            }
          />
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
