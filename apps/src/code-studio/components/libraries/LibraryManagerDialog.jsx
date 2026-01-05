import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import LibraryListItem from '@cdo/apps/code-studio/components/libraries/LibraryListItem';
import LibraryViewCode from '@cdo/apps/code-studio/components/libraries/LibraryViewCode';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';

import libraryParser from './libraryParser';

import styles from './library-manager-dialog.module.scss';

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

const DisplayLibraryMode = {
  NONE: 'none',
  VIEW: 'view',
  UPDATE: 'update',
};

export class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
  };

  state = {
    importLibraryId: '',
    projectLibraries: [],
    classLibraries: [],
    cachedClassLibraries: [],
    displayLibrary: null,
    displayLibraryMode: DisplayLibraryMode.NONE,
    isLoading: false,
    errorMessages: {},
    updatedLibraryChannels: [],
    sectionFilter: '',
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    let projectLibraries = dashboard.project.getProjectLibraries() || [];
    this.setState({projectLibraries});

    let libraryClient = new LibraryClientApi();
    libraryClient.getClassLibraries(
      classLibraries => {
        projectLibraries = mapUserNameToProjectLibraries(
          projectLibraries,
          classLibraries
        );
        this.setState({classLibraries, projectLibraries});
      },
      error => {
        this.setState({
          errorMessages: {
            ...this.state.errorMessages,
            loadClassLibraries: i18n.errorFindingClassLibraries(),
          },
        });
      }
    );

    this.fetchUpdates(projectLibraries);
  };

  fetchUpdates = libraries => {
    if (libraries.length === 0) {
      return;
    }

    const libraryQuery = libraries.map(library => ({
      channel_id: library.channelId,
      version: library.versionId,
    }));

    $.ajax({
      method: 'GET',
      url: `/libraries/get_updates?libraries=${JSON.stringify(libraryQuery)}`,
    }).done(updatedLibraryChannels => this.setState({updatedLibraryChannels}));
  };

  setLibraryToImport = event => {
    this.setState({
      importLibraryId: event.target.value,
      errorMessages: {...this.state.errorMessages, importFromId: undefined},
    });
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
    if (!libraryJson) {
      return;
    }

    const {projectLibraries} = this.state;
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
      this.setState({
        errorMessages: {
          ...this.state.errorMessages,
          importFromId: i18n.libraryImportError(),
        },
        isLoading: false,
      });
    } else if (libraryJson) {
      this.addLibraryToProject(libraryJson);
    }
  };

  fetchLatestLibrary = (channelId, callback, event) => {
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
              cachedClassLibraries: [...cachedClassLibraries, updatedjson],
              isLoading: false,
            });
            callback(updatedjson, null);
          },
          errorCallback
        ),
      errorCallback,
      event
    );
  };

  removeLibrary = channelId => {
    const {projectLibraries} = this.state;
    dashboard.project.setProjectLibraries(
      projectLibraries.filter(library => {
        return library.channelId !== channelId;
      })
    );
    this.setState({projectLibraries: dashboard.project.getProjectLibraries()});
  };

  displayProjectLibraries = () => {
    const {projectLibraries, updatedLibraryChannels} = this.state;
    if (!Array.isArray(projectLibraries) || !projectLibraries.length) {
      return (
        <div className={styles.message}>{i18n.noLibrariesInProject()}</div>
      );
    }

    const onUpdate = channelId => {
      this.fetchLatestLibrary(
        channelId,
        lib => this.viewCode(lib, DisplayLibraryMode.UPDATE),
        'update' /* event */
      );
    };

    return projectLibraries.map(library => {
      return (
        <LibraryListItem
          key={library.channelId}
          library={library}
          onUpdate={
            updatedLibraryChannels.includes(library.channelId)
              ? onUpdate
              : undefined
          }
          onRemove={this.removeLibrary}
          onViewCode={() => this.viewCode(library)}
        />
      );
    });
  };

  displayClassLibraries = () => {
    const {classLibraries, errorMessages, sectionFilter} = this.state;
    if (errorMessages.loadClassLibraries) {
      return (
        <div className={styles.error}>{errorMessages.loadClassLibraries}</div>
      );
    }
    if (!Array.isArray(classLibraries) || !classLibraries.length) {
      return <div className={styles.message}>{i18n.noLibrariesInClass()}</div>;
    }

    const filteredLibraries = sectionFilter
      ? classLibraries.filter(library => library.sectionName === sectionFilter)
      : classLibraries;

    return filteredLibraries.map(library => {
      return (
        <LibraryListItem
          key={library.channel}
          library={library}
          onAdd={() =>
            this.fetchLatestLibrary(
              library.channel,
              this.addLibraryToProject,
              'add' /* event */
            )
          }
          onViewCode={() =>
            this.fetchLatestLibrary(
              library.channel,
              this.viewCode,
              'view' /* event */
            )
          }
        />
      );
    });
  };

  viewCode = (library, mode) => {
    if (!library) {
      return;
    }

    this.setState({
      displayLibrary: library,
      displayLibraryMode: mode || DisplayLibraryMode.VIEW,
    });
  };

  closeLibraryManager = () => {
    this.setState({cachedClassLibraries: []});
    this.props.onClose();
  };

  renderDisplayLibrary = () => {
    const {displayLibrary, displayLibraryMode} = this.state;
    if (!displayLibrary) {
      return null;
    }

    const onClose = () =>
      this.setState({
        displayLibrary: null,
        displayLibraryMode: DisplayLibraryMode.NONE,
      });

    switch (displayLibraryMode) {
      case DisplayLibraryMode.VIEW:
        return (
          <LibraryViewCode
            title={displayLibrary.name}
            description={displayLibrary.description}
            onClose={onClose}
            sourceCode={displayLibrary.source}
          />
        );
      case DisplayLibraryMode.UPDATE:
        return (
          <LibraryViewCode
            title={i18n.updateLibraryConfirmation({
              libraryName: displayLibrary.name,
            })}
            description={displayLibrary.description}
            onClose={onClose}
            sourceCode={displayLibrary.source}
            buttons={
              <div className={styles.updateButtons}>
                <Button
                  text={i18n.cancel()}
                  color={Button.ButtonColor.gray}
                  onClick={onClose}
                />
                <Button
                  text={i18n.update()}
                  onClick={() => this.updateLibraryInProject(displayLibrary)}
                />
              </div>
            }
          />
        );
      default:
        return null;
    }
  };

  render() {
    const {isOpen} = this.props;
    const {
      importLibraryId,
      displayLibrary,
      isLoading,
      errorMessages,
      classLibraries,
    } = this.state;

    if (!isOpen) {
      return null;
    }

    const sections = [
      ...new Set(classLibraries.map(library => library.sectionName)),
    ];

    return (
      <div>
        <BaseDialog
          isOpen
          handleClose={this.closeLibraryManager}
          className={classNames(styles.dialog, {
            [styles.hidden]: displayLibrary,
          })}
          useUpdatedStyles
        >
          <div className={styles.marginSides}>
            <h1 className={styles.header}>{i18n.libraryManage()}</h1>
            <div className={styles.libraryList}>
              {this.displayProjectLibraries()}
            </div>
            <h2 className={styles.subHeader}>{i18n.libraryClassImport()}</h2>
            <div style={{textAlign: 'left'}}>
              <label className={styles.messageInline}>
                {i18n.showingLibrariesFromSection()}
              </label>
              <select
                onChange={event =>
                  this.setState({sectionFilter: event.target.value})
                }
              >
                <option value="">{i18n.all()}</option>
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.libraryList}>
              {this.displayClassLibraries()}
            </div>
            <h2 className={styles.subHeader}>{i18n.libraryIdImport()}</h2>
            <div className={styles.inputParent} id="ui-test-import-library">
              <input
                className={styles.linkBox}
                type="text"
                value={importLibraryId}
                onChange={this.setLibraryToImport}
              />
              <button
                className={styles.addButton}
                onClick={() => {
                  this.setState({isLoading: true});
                  this.fetchLatestLibrary(
                    importLibraryId,
                    this.addLibraryById,
                    'import' /* event */
                  );
                }}
                type="button"
                disabled={!importLibraryId}
              >
                {isLoading && (
                  <FontAwesome icon="spinner" className="fa-spin" />
                )}
                {!isLoading && i18n.add()}
              </button>
            </div>
            <div className={styles.error}>{errorMessages.importFromId}</div>
          </div>
        </BaseDialog>
        {displayLibrary && this.renderDisplayLibrary()}
      </div>
    );
  }
}
export default LibraryManagerDialog;
