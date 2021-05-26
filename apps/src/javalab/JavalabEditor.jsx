import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {
  setSource,
  sourceVisibilityUpdated,
  sourceValidationUpdated,
  renameFile,
  removeFile
} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import {EditorView} from '@codemirror/view';
import {editorSetup, lightMode} from './editorSetup';
import {EditorState, tagExtension} from '@codemirror/state';
import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {oneDark} from '@codemirror/theme-one-dark';
import color from '@cdo/apps/util/color';
import {Tab, Nav, NavItem} from 'react-bootstrap';
import NameFileDialog from './NameFileDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import JavalabEditorTabMenu from './JavalabEditorTabMenu';
import JavalabFileExplorer from './JavalabFileExplorer';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';
import msg from '@cdo/locale';

const style = {
  editor: {
    width: '100%',
    height: 400,
    backgroundColor: color.white
  },
  darkBackground: {
    backgroundColor: color.dark_slate_gray
  },
  fileMenuToggleButton: {
    margin: '0, 0, 0, 4px',
    padding: 0,
    height: 20,
    width: 13,
    backgroundColor: 'transparent',
    border: 'none',
    ':hover': {
      cursor: 'pointer',
      boxShadow: 'none'
    }
  },
  darkFileMenuToggleButton: {
    color: color.white
  },
  fileTypeIcon: {
    margin: 5
  },
  tabs: {
    backgroundColor: color.background_gray,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center'
  }
};

const RENAME_FILE = 'renameFile';
const DELETE_FILE = 'deleteFile';
const CREATE_FILE = 'createFile';

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onCommitCode: PropTypes.func.isRequired,
    // populated by redux
    setSource: PropTypes.func,
    sourceVisibilityUpdated: PropTypes.func,
    sourceValidationUpdated: PropTypes.func,
    renameFile: PropTypes.func,
    removeFile: PropTypes.func,
    sources: PropTypes.object,
    isDarkMode: PropTypes.bool,
    isEditingStartSources: PropTypes.bool,
    handleVersionHistory: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.toggleTabMenu = this.toggleTabMenu.bind(this);
    this.renameFromTabMenu = this.renameFromTabMenu.bind(this);
    this.deleteFromTabMenu = this.deleteFromTabMenu.bind(this);
    this.cancelTabMenu = this.cancelTabMenu.bind(this);

    this.onRenameFile = this.onRenameFile.bind(this);
    this.onCreateFile = this.onCreateFile.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onOpenFile = this.onOpenFile.bind(this);
    this.updateVisibility = this.updateVisibility.bind(this);
    this.updateValidation = this.updateValidation.bind(this);
    this.updateFileType = this.updateFileType.bind(this);
    this._codeMirrors = {};

    // fileMetadata is a dictionary of file key -> filename.
    let fileMetadata = {};
    // tab order is an ordered list of file keys.
    let orderedTabKeys = [];
    Object.keys(props.sources).forEach((file, index) => {
      if (props.sources[file].isVisible || props.isEditingStartSources) {
        let tabKey = this.getTabKey(index);
        fileMetadata[tabKey] = file;
        orderedTabKeys.push(tabKey);
      }
    });

    const firstTabKey = orderedTabKeys.length > 0 ? orderedTabKeys[0] : null;

    this.state = {
      orderedTabKeys,
      fileMetadata,
      showMenu: false,
      contextTarget: null,
      openDialog: null,
      menuPosition: {},
      editTabKey: null,
      newFileError: null,
      renameFileError: null,
      activeTabKey: firstTabKey,
      lastTabKeyIndex: orderedTabKeys.length - 1,
      fileToDelete: null
    };
  }

  componentDidMount() {
    this.editors = {};
    const {sources} = this.props;
    const {orderedTabKeys, fileMetadata} = this.state;
    orderedTabKeys.forEach(tabKey => {
      this.createEditor(tabKey, sources[fileMetadata[tabKey]].text);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isDarkMode !== this.props.isDarkMode) {
      const newStyle = this.props.isDarkMode ? oneDark : lightMode;
      Object.keys(this.editors).forEach(editorKey => {
        this.editors[editorKey].dispatch({
          reconfigure: {style: newStyle}
        });
      });
    }

    const {fileMetadata} = this.state;
    if (
      !_.isEqual(Object.keys(prevState.fileMetadata), Object.keys(fileMetadata))
    ) {
      for (const tabKey in fileMetadata) {
        if (!this.editors[tabKey]) {
          // create an editor if it doesn't exist yet
          const source = this.props.sources[fileMetadata[tabKey]];
          const doc = (source && source.text) || '';
          this.createEditor(tabKey, doc);
        }
      }
    }
  }

  createEditor(key, doc) {
    const {isDarkMode} = this.props;
    const extensions = [...editorSetup];

    if (isDarkMode) {
      extensions.push(tagExtension('style', oneDark));
    } else {
      extensions.push(tagExtension('style', lightMode));
    }
    this.editors[key] = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: extensions
      }),
      parent: this._codeMirrors[key],
      dispatch: this.dispatchEditorChange(key)
    });
  }

  dispatchEditorChange = key => {
    // tr is a code mirror transaction
    // see https://codemirror.net/6/docs/ref/#state.Transaction
    return tr => {
      // we are overwriting the default dispatch method for codemirror,
      // so we need to manually call the update method.
      this.editors[key].update([tr]);
      // if there are changes to the editor, update redux.
      if (!tr.changes.empty && tr.newDoc) {
        this.props.setSource(
          this.state.fileMetadata[key],
          tr.newDoc.toString()
        );
        projectChanged();
      }
    };
  };

  updateVisibility(key, isVisible) {
    this.props.sourceVisibilityUpdated(this.state.fileMetadata[key], isVisible);
    this.setState({
      showMenu: false,
      contextTarget: null
    });
  }

  updateValidation(key, isValidation) {
    this.props.sourceValidationUpdated(
      this.state.fileMetadata[key],
      isValidation
    );
    this.setState({
      showMenu: false,
      contextTarget: null
    });
  }

  updateFileType(key, isVisible, isValidation) {
    this.updateVisibility(key, isVisible);
    this.updateValidation(key, isValidation);
  }

  getTabKey(index) {
    return `file-${index}`;
  }

  makeListeners(key) {
    return {
      onContextMenu: e => {
        this.openTabContextMenu(key, e);
      }
    };
  }

  onChangeTabs(key) {
    if (key !== this.state.activeTabKey) {
      this.setState({
        showMenu: false,
        contextTarget: null,
        activeTabKey: key
      });
    }
  }

  // This opens and closes the dropdown menu on the active tab
  toggleTabMenu(key, e) {
    if (key === this.state.contextTarget) {
      this.cancelTabMenu();
    } else {
      e.preventDefault();
      const boundingRect = e.target.getBoundingClientRect();
      this.setState({
        showMenu: true,
        contextTarget: key,
        menuPosition: {
          top: `${boundingRect.bottom}px`,
          left: `${boundingRect.left}px`
        }
      });
    }
  }

  // This is called from the dropdown menu on the active tab
  // when the rename option is clicked
  renameFromTabMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null,
      editTabKey: this.state.contextTarget,
      openDialog: RENAME_FILE
    });
  }

  // This closes the dropdown menu on the active tab
  cancelTabMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null
    });
  }

  // This is called from the dropdown menu on the active tab
  // when the delete option is clicked
  deleteFromTabMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null,
      openDialog: DELETE_FILE,
      fileToDelete: this.state.contextTarget
    });
  }

  onRenameFile(newFilename) {
    const {fileMetadata, editTabKey} = this.state;
    // check for duplicate filename
    if (Object.keys(this.props.sources).includes(newFilename)) {
      this.setState({
        renameFileError: this.duplicateFileError(newFilename)
      });
      return;
    }

    // update file metadata with new filename
    const newFileMetadata = {...fileMetadata};
    newFileMetadata[editTabKey] = newFilename;
    const oldFilename = fileMetadata[editTabKey];

    // update sources with new filename
    this.props.renameFile(oldFilename, newFilename);
    projectChanged();
    this.setState({
      fileMetadata: newFileMetadata,
      openDialog: null,
      renameFileError: null
    });
  }

  onCreateFile(filename) {
    if (Object.keys(this.props.sources).includes(filename)) {
      this.setState({
        newFileError: this.duplicateFileError(filename)
      });
      return;
    }

    const newTabIndex = this.state.lastTabKeyIndex + 1;
    const newTabKey = this.getTabKey(newTabIndex);

    // update file key to filename map with new file name
    const newFileMetadata = {...this.state.fileMetadata};
    newFileMetadata[newTabKey] = filename;

    // add new key to tabs
    let newTabs = [...this.state.orderedTabKeys];
    newTabs.push(newTabKey);

    // add new file to sources
    this.props.setSource(filename, '');
    projectChanged();

    // add new tab and set it as the active tab
    this.setState({
      orderedTabKeys: newTabs,
      fileMetadata: newFileMetadata,
      activeTabKey: newTabKey,
      lastTabKeyIndex: newTabIndex,
      openDialog: null,
      newFileError: null
    });
  }

  onDeleteFile() {
    const {
      orderedTabKeys,
      fileMetadata,
      activeTabKey,
      fileToDelete
    } = this.state;
    // find tab in list
    const indexToRemove = orderedTabKeys.indexOf(fileToDelete);

    if (indexToRemove >= 0) {
      // delete from tabs
      let newTabs = [...orderedTabKeys];
      newTabs.splice(indexToRemove, 1);
      let newActiveTabKey = activeTabKey;
      // we need to update the active tab if we are deleting the currently active tab
      if (activeTabKey === fileToDelete) {
        // if there is still at least 1 file, go to first file, otherwise wipe out active tab key
        newActiveTabKey = newTabs.length > 0 ? newTabs[0] : null;
      }

      // delete tab key from tab to filename map
      const newFileMetadata = {...fileMetadata};
      delete newFileMetadata[fileToDelete];
      // clean up editors
      delete this.editors[fileToDelete];

      this.setState({
        orderedTabKeys: newTabs,
        activeTabKey: newActiveTabKey,
        fileMetadata: newFileMetadata
      });

      // delete from sources
      this.props.removeFile(fileMetadata[fileToDelete]);
      projectChanged();
    }

    this.setState({
      showMenu: false,
      contextTarget: null,
      openDialog: null,
      fileToDelete: null
    });
  }

  duplicateFileError(filename) {
    return `Filename ${filename} is already in use in this project. Please choose a different name`;
  }

  // This is called from the file explorer when we want to jump to a file
  onOpenFile(key) {
    let newTabs = [...this.state.orderedTabKeys];
    let selectedFileIndex = newTabs.indexOf(key);
    newTabs.splice(selectedFileIndex, 1);
    newTabs.unshift(key);
    // closes the tab menu if it is open
    this.setState({
      activeTabKey: key,
      orderedTabKeys: newTabs,
      showMenu: false,
      contextTarget: null
    });
  }

  render() {
    const {
      orderedTabKeys,
      fileMetadata,
      activeTabKey,
      editTabKey,
      openDialog,
      fileToDelete,
      contextTarget,
      renameFileError,
      newFileError
    } = this.state;
    const {
      onCommitCode,
      isDarkMode,
      sources,
      isEditingStartSources
    } = this.props;

    let menuStyle = {
      display: this.state.showMenu ? 'block' : 'none',
      position: 'fixed',
      top: this.state.menuPosition.top,
      left: this.state.menuPosition.left,
      backgroundColor: '#F0F0F0'
    };
    return (
      <div style={this.props.style}>
        <PaneHeader hasFocus>
          <PaneButton
            id="javalab-editor-create-file"
            iconClass="fa fa-plus-circle"
            onClick={() => this.setState({openDialog: CREATE_FILE})}
            headerHasFocus
            isRtl={false}
            label="New File"
            leftJustified
          />
          <PaneButton
            id="javalab-editor-backpack"
            iconClass="fa fa-briefcase"
            headerHasFocus
            isRtl={false}
            label="Backpack"
            leftJustified
          />
          <PaneButton
            id="data-mode-versions-header"
            iconClass="fa fa-clock-o"
            label={msg.showVersionsHeader()}
            headerHasFocus
            isRtl={false}
            onClick={this.props.handleVersionHistory}
          />
          <PaneButton
            id="javalab-editor-save"
            iconClass="fa fa-check-circle"
            onClick={onCommitCode}
            headerHasFocus
            isRtl={false}
            label="Commit Code"
          />
          <PaneSection>Editor</PaneSection>
        </PaneHeader>
        <Tab.Container
          activeKey={activeTabKey}
          onSelect={key => this.onChangeTabs(key)}
          id="javalab-editor-tabs"
          className={isDarkMode ? 'darkmode' : ''}
        >
          <div>
            <Nav bsStyle="tabs" style={style.tabs}>
              <JavalabFileExplorer
                fileMetadata={fileMetadata}
                onSelectFile={this.onOpenFile}
                isDarkMode={isDarkMode}
              />
              {orderedTabKeys.map(tabKey => {
                return (
                  <NavItem eventKey={tabKey} key={`${tabKey}-tab`}>
                    {isEditingStartSources && (
                      <FontAwesome
                        style={style.fileTypeIcon}
                        icon={
                          sources[fileMetadata[tabKey]].isVisible
                            ? 'eye'
                            : sources[fileMetadata[tabKey]].isValidation
                            ? 'flask'
                            : 'eye-slash'
                        }
                      />
                    )}
                    {!isEditingStartSources && (
                      <FontAwesome
                        style={style.fileTypeIcon}
                        icon={'file-text'}
                      />
                    )}
                    <span>{fileMetadata[tabKey]}</span>

                    <button
                      ref={`${tabKey}-file-toggle`}
                      type="button"
                      style={{
                        ...style.fileMenuToggleButton,
                        ...(this.props.isDarkMode &&
                          style.darkFileMenuToggleButton),
                        ...(activeTabKey !== tabKey && {visibility: 'hidden'})
                      }}
                      onClick={e => this.toggleTabMenu(tabKey, e)}
                      className="no-focus-outline"
                      disabled={activeTabKey === tabKey}
                    >
                      <FontAwesome
                        icon={
                          contextTarget === tabKey ? 'caret-up' : 'caret-down'
                        }
                      />
                    </button>
                  </NavItem>
                );
              })}
            </Nav>
            <Tab.Content animation={false}>
              {orderedTabKeys.map(tabKey => {
                return (
                  <Tab.Pane eventKey={tabKey} key={`${tabKey}-content`}>
                    <div
                      ref={el => (this._codeMirrors[tabKey] = el)}
                      style={{
                        ...style.editor,
                        ...(isDarkMode && style.darkBackground)
                      }}
                    />
                  </Tab.Pane>
                );
              })}
            </Tab.Content>
          </div>
        </Tab.Container>
        <div style={menuStyle}>
          <JavalabEditorTabMenu
            cancelTabMenu={this.cancelTabMenu}
            renameFromTabMenu={this.renameFromTabMenu}
            deleteFromTabMenu={this.deleteFromTabMenu}
            changeFileTypeFromTabMenu={(isVisible, isValidation) =>
              this.updateFileType(activeTabKey, isVisible, isValidation)
            }
            showVisibilityOption={isEditingStartSources}
            fileIsVisible={
              sources[fileMetadata[activeTabKey]] &&
              sources[fileMetadata[activeTabKey]].isVisible
            }
            fileIsValidation={
              sources[fileMetadata[activeTabKey]] &&
              sources[fileMetadata[activeTabKey]].isValidation
            }
          />
        </div>
        <DeleteConfirmationDialog
          isOpen={openDialog === DELETE_FILE}
          handleConfirm={this.onDeleteFile}
          handleClose={() => this.setState({openDialog: null})}
          filename={fileMetadata[fileToDelete]}
          isDarkMode={isDarkMode}
        />
        <NameFileDialog
          isOpen={openDialog === RENAME_FILE}
          handleClose={() =>
            this.setState({openDialog: null, renameFileError: null})
          }
          filename={fileMetadata[editTabKey]}
          handleSave={this.onRenameFile}
          isDarkMode={isDarkMode}
          inputLabel="Rename the file"
          saveButtonText="Rename"
          errorMessage={renameFileError}
        />
        <NameFileDialog
          isOpen={openDialog === CREATE_FILE}
          handleClose={() =>
            this.setState({openDialog: null, newFileError: null})
          }
          handleSave={this.onCreateFile}
          isDarkMode={isDarkMode}
          inputLabel="Create new file"
          saveButtonText="Create"
          errorMessage={newFileError}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    sources: state.javalab.sources,
    isDarkMode: state.javalab.isDarkMode,
    isEditingStartSources: state.pageConstants.isEditingStartSources
  }),
  dispatch => ({
    setSource: (filename, source) => dispatch(setSource(filename, source)),
    sourceVisibilityUpdated: (filename, isVisible) =>
      dispatch(sourceVisibilityUpdated(filename, isVisible)),
    sourceValidationUpdated: (filename, isValidation) =>
      dispatch(sourceValidationUpdated(filename, isValidation)),
    renameFile: (oldFilename, newFilename) =>
      dispatch(renameFile(oldFilename, newFilename)),
    removeFile: filename => dispatch(removeFile(filename))
  })
)(Radium(JavalabEditor));
