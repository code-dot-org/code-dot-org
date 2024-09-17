import {java} from '@codemirror/lang-java';
import {EditorState, Compartment} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Nav, NavItem} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {hasQueryParam} from '@cdo/apps/code-studio/utils';
import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {
  darkMode,
  lightMode,
} from '@cdo/apps/lab2/views/components/editor/editorThemes';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import javalabMsg from '@cdo/javalab/locale';
import i18n from '@cdo/locale';

import {DisplayTheme} from './DisplayTheme';
import JavalabEditorDialogManager from './JavalabEditorDialogManager';
import JavalabEditorHeader from './JavalabEditorHeader';
import JavalabEditorTabMenu from './JavalabEditorTabMenu';
import JavalabFileExplorer from './JavalabFileExplorer';
import {
  getDefaultFileContents,
  getTabKey,
  isJavaFile,
} from './JavalabFileHelper';
import {
  setSource,
  sourceTextUpdated,
  sourceVisibilityUpdated,
  sourceValidationUpdated,
  sourceFileOrderUpdated,
  renameFile,
  removeFile,
  setEditTabKey,
  setActiveTabKey,
  setOrderedTabKeys,
  setFileMetadata,
  setAllEditorMetadata,
  openEditorDialog,
  closeEditorDialog,
  clearRenameFileError,
  setNewFileError,
  clearNewFileError,
  setRenameFileError,
} from './redux/editorRedux';
import {setRenderedHeight, setEditorColumnHeight} from './redux/viewRedux';
import {JavalabEditorDialog} from './types';

import style from './javalab-editor.module.scss';

// This is the height of the "editor" header and the file tabs combined
const HEADER_OFFSET = 63;
const EDITOR_LOAD_PAUSE_MS = 100;

class JavalabEditor extends React.Component {
  static propTypes = {
    onCommitCode: PropTypes.func.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    handleClearPuzzle: PropTypes.func.isRequired,
    viewMode: PropTypes.string,

    // populated by redux
    setSource: PropTypes.func,
    sourceFileOrderUpdated: PropTypes.func,
    sourceVisibilityUpdated: PropTypes.func,
    sourceValidationUpdated: PropTypes.func,
    sourceTextUpdated: PropTypes.func,
    renameFile: PropTypes.func,
    removeFile: PropTypes.func,
    sources: PropTypes.object,
    validation: PropTypes.object,
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)),
    height: PropTypes.number,
    isEditingStartSources: PropTypes.bool,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    hasOpenCodeReview: PropTypes.bool,
    isViewingOwnProject: PropTypes.bool,
    codeOwnersName: PropTypes.string,
    fileMetadata: PropTypes.object.isRequired,
    setFileMetadata: PropTypes.func.isRequired,
    orderedTabKeys: PropTypes.array.isRequired,
    setOrderedTabKeys: PropTypes.func.isRequired,
    activeTabKey: PropTypes.string,
    setActiveTabKey: PropTypes.func.isRequired,
    lastTabKeyIndex: PropTypes.number.isRequired,
    editTabKey: PropTypes.string,
    setEditTabKey: PropTypes.func.isRequired,
    setAllEditorMetadata: PropTypes.func.isRequired,
    openEditorDialog: PropTypes.func.isRequired,
    closeEditorDialog: PropTypes.func.isRequired,
    setNewFileError: PropTypes.func.isRequired,
    clearNewFileError: PropTypes.func.isRequired,
    setRenameFileError: PropTypes.func.isRequired,
    clearRenameFileError: PropTypes.func.isRequired,
    editorFontSize: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.toggleTabMenu = this.toggleTabMenu.bind(this);
    this.renameFromTabMenu = this.renameFromTabMenu.bind(this);
    this.moveTabLeft = this.moveTabLeft.bind(this);
    this.moveTabRight = this.moveTabRight.bind(this);
    this.deleteFromTabMenu = this.deleteFromTabMenu.bind(this);
    this.cancelTabMenu = this.cancelTabMenu.bind(this);

    this.onRenameFile = this.onRenameFile.bind(this);
    this.onCreateFile = this.onCreateFile.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onOpenFile = this.onOpenFile.bind(this);
    this.updateVisibility = this.updateVisibility.bind(this);
    this.updateValidation = this.updateValidation.bind(this);
    this.updateFileType = this.updateFileType.bind(this);
    this.updateFileOrder = this.updateFileOrder.bind(this);
    this.onImportFile = this.onImportFile.bind(this);
    this._codeMirrors = {};

    // Used to manage dark and light mode configuration.
    this.editorModeConfigCompartment = new Compartment();
    this.editorThemeOverrideCompartment = new Compartment();

    // Used to manage readOnly/editable configuration.
    this.editorEditableCompartment = new Compartment();
    this.editorReadOnlyCompartment = new Compartment();

    this.languageCompartment = new Compartment();

    this.fontSizeCompartment = new Compartment();

    this.state = {
      showMenu: false,
      contextTarget: null,
      menuPosition: {},
      fileToDelete: null,
    };
  }

  componentDidMount() {
    this.editors = {};
    const {sources, orderedTabKeys, fileMetadata} = this.props;
    orderedTabKeys.forEach(tabKey => {
      this.createEditor(tabKey, sources[fileMetadata[tabKey]].text);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.displayTheme !== this.props.displayTheme) {
      const newStyle =
        this.props.displayTheme === DisplayTheme.DARK ? darkMode : lightMode;

      Object.keys(this.editors).forEach(editorKey => {
        this.editors[editorKey].dispatch({
          effects: this.editorModeConfigCompartment.reconfigure(newStyle),
        });
      });
    }

    if (prevProps.isReadOnlyWorkspace !== this.props.isReadOnlyWorkspace) {
      Object.keys(this.editors).forEach(editorKey => {
        this.editors[editorKey].dispatch({
          effects: [
            this.editorEditableCompartment.reconfigure(
              EditorView.editable.of(!this.props.isReadOnlyWorkspace)
            ),
            this.editorReadOnlyCompartment.reconfigure(
              EditorState.readOnly.of(this.props.isReadOnlyWorkspace)
            ),
          ],
        });
      });
    }

    if (prevProps.editorFontSize !== this.props.editorFontSize) {
      Object.keys(this.editors).forEach(editorKey => {
        this.editors[editorKey].dispatch({
          effects: this.fontSizeCompartment.reconfigure(
            this.getFontSizeTheme(this.props.editorFontSize)
          ),
        });
      });
    }

    const {fileMetadata} = this.props;

    if (
      !_.isEqual(Object.keys(prevProps.fileMetadata), Object.keys(fileMetadata))
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
    const {displayTheme, isReadOnlyWorkspace, fileMetadata, editorFontSize} =
      this.props;
    const extensions = [...editorConfig];

    extensions.push(
      displayTheme === DisplayTheme.DARK
        ? this.editorModeConfigCompartment.of(darkMode)
        : this.editorModeConfigCompartment.of(lightMode)
    );

    extensions.push(
      this.editorEditableCompartment.of(
        EditorView.editable.of(!isReadOnlyWorkspace)
      ),
      this.editorReadOnlyCompartment.of(
        EditorState.readOnly.of(isReadOnlyWorkspace)
      )
    );

    // Set the language, which determines syntax highlighting.
    // We only support Java or no language (no highlighting, good for text files)
    if (isJavaFile(fileMetadata[key])) {
      extensions.push(this.languageCompartment.of(java()));
    } else {
      extensions.push(this.languageCompartment.of([]));
    }

    extensions.push(
      this.fontSizeCompartment.of(this.getFontSizeTheme(editorFontSize))
    );

    this.editors[key] = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: extensions,
      }),
      parent: this._codeMirrors[key],
      dispatch: this.dispatchEditorChange(key),
    });
  }

  getFontSizeTheme(fontSize) {
    return EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
      },
    });
  }

  dispatchEditorChange = key => {
    const {sourceTextUpdated} = this.props;

    // tr is a code mirror transaction
    // see https://codemirror.net/6/docs/ref/#state.Transaction
    return tr => {
      // we are overwriting the default dispatch method for codemirror,
      // so we need to manually call the update method.
      this.editors[key].update([tr]);
      // if there are changes to the editor, update redux.
      if (!tr.changes.empty && tr.newDoc) {
        sourceTextUpdated(this.props.fileMetadata[key], tr.newDoc.toString());
        projectChanged();
      }
    };
  };

  // This function updates the tabOrder of files in sources according to orderedTabKeys,
  // saves the project.
  updateFileOrder() {
    this.props.sourceFileOrderUpdated();
    projectChanged();
  }

  updateVisibility(key, isVisible) {
    this.props.sourceVisibilityUpdated(this.props.fileMetadata[key], isVisible);
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  updateValidation(key, isValidation) {
    this.props.sourceValidationUpdated(
      this.props.fileMetadata[key],
      isValidation
    );
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  updateFileType(key, isVisible, isValidation) {
    this.updateVisibility(key, isVisible);
    this.updateValidation(key, isValidation);
  }

  makeListeners(key) {
    return {
      onContextMenu: e => {
        this.openTabContextMenu(key, e);
      },
    };
  }

  onChangeTabs(key) {
    if (key !== this.props.activeTabKey) {
      this.props.setActiveTabKey(key);
      this.setState({
        showMenu: false,
        contextTarget: null,
      });
      // scroll the new editor to whatever its current selection is.
      // If this editor has no selection it will stay at the top of the file.
      this.editors[key].dispatch({
        scrollIntoView: true,
      });
      // It takes a second for the editor to show up. We can't
      // focus on it until it is visible, so we set a delay to focus
      // on the new editor.
      const timer = setInterval(() => {
        this.editors[key].focus();
        if (this.editors[key].hasFocus) {
          // stop trying to focus once we have focused.
          clearInterval(timer);
        }
      }, EDITOR_LOAD_PAUSE_MS);
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
          left: `${boundingRect.left}px`,
        },
      });
    }
  }

  // This is called from the dropdown menu on the active tab
  // when the rename option is clicked
  renameFromTabMenu() {
    this.props.setEditTabKey(this.state.contextTarget);
    this.props.openEditorDialog(JavalabEditorDialog.RENAME_FILE);
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  // This closes the dropdown menu on the active tab
  cancelTabMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  // This moves the active tab to the left in the tab menu
  moveTabLeft() {
    const {activeTabKey, orderedTabKeys} = this.props;
    let index = orderedTabKeys.indexOf(activeTabKey);
    this.swapTabsSetKeysCloseTab(index - 1, index);
  }

  // This moves the active tab to the right in the tab menu
  moveTabRight() {
    const {activeTabKey, orderedTabKeys} = this.props;
    let index = orderedTabKeys.indexOf(activeTabKey);
    this.swapTabsSetKeysCloseTab(index, index + 1);
  }

  swapTabsSetKeysCloseTab(index1, index2) {
    // handle swapping of tabs and closing the tab menu
    const newTabs = [...this.props.orderedTabKeys];
    if (index1 >= 0 && index2 <= newTabs.length - 1) {
      let file1 = newTabs[index1];
      newTabs[index1] = newTabs[index2];
      newTabs[index2] = file1;
      this.props.setOrderedTabKeys(newTabs);
    }
    this.updateFileOrder();
    // closes the tab menu if it is open
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  // This is called from the dropdown menu on the active tab
  // when the delete option is clicked
  deleteFromTabMenu() {
    this.props.openEditorDialog(JavalabEditorDialog.DELETE_FILE);
    this.setState({
      showMenu: false,
      contextTarget: null,
      fileToDelete: this.state.contextTarget,
    });
  }

  // Checks if the given file name is valid and if not, calls the given setErrorMessage
  // callback with the appropriate error message. Returns whether or not the file name is valid.
  validateFileName(filename, setErrorMessage) {
    let errorMessage;

    if (!filename) {
      errorMessage = javalabMsg.missingFilenameError();
    } else if (
      filename === '.java' ||
      (filename.toLowerCase().endsWith('.java') && !filename.endsWith('.java'))
    ) {
      // if filename is either only '.java' or ends with a non-lowercase casing of '.java',
      // give an error with an example Java filename.
      errorMessage = javalabMsg.invalidJavaFilenameFormat();
    } else if (filename.endsWith('.java') && /\s/g.test(filename)) {
      // Java file names cannot contains spaces
      errorMessage = javalabMsg.invalidJavaFilename();
    }

    if (errorMessage) {
      setErrorMessage(errorMessage);
    }

    return !errorMessage;
  }

  onRenameFile(newFilename) {
    const {
      fileMetadata,
      setFileMetadata,
      editTabKey,
      renameFile,
      closeEditorDialog,
      setRenameFileError,
      clearRenameFileError,
    } = this.props;
    newFilename = newFilename.trim();
    if (!this.validateFileName(newFilename, setRenameFileError)) {
      return;
    }
    // check for duplicate filename
    const duplicateFileError = this.checkDuplicateFileName(newFilename);
    if (duplicateFileError) {
      setRenameFileError(duplicateFileError);
      return;
    }

    // update file metadata with new filename
    const newFileMetadata = {...fileMetadata};
    newFileMetadata[editTabKey] = newFilename;
    const oldFilename = fileMetadata[editTabKey];

    // update sources with new filename
    renameFile(oldFilename, newFilename);
    setFileMetadata(newFileMetadata);

    // change syntax highlighting if there was a change from non-java to java or vice-versa
    if (isJavaFile(newFilename) && !isJavaFile(oldFilename)) {
      this.editors[editTabKey].dispatch({
        effects: this.languageCompartment.reconfigure(java()),
      });
    } else if (!isJavaFile(newFilename) && isJavaFile(oldFilename)) {
      this.editors[editTabKey].dispatch({
        effects: this.languageCompartment.reconfigure([]),
      });
    }

    projectChanged();
    closeEditorDialog();
    clearRenameFileError();
  }

  onCreateFile(filename, fileContents) {
    const {
      lastTabKeyIndex,
      fileMetadata,
      orderedTabKeys,
      setSource,
      setAllEditorMetadata,
      closeEditorDialog,
      setNewFileError,
      clearNewFileError,
    } = this.props;
    filename = filename.trim();
    if (!this.validateFileName(filename, setNewFileError)) {
      return;
    }
    const duplicateFileError = this.checkDuplicateFileName(filename);
    if (duplicateFileError) {
      setNewFileError(duplicateFileError);
      return;
    }

    const newTabIndex = lastTabKeyIndex + 1;
    const newTabKey = getTabKey(newTabIndex);
    fileContents =
      fileContents || getDefaultFileContents(filename, this.props.viewMode);

    // update file key to filename map with new file name
    const newFileMetadata = {...fileMetadata};
    newFileMetadata[newTabKey] = filename;

    // add new key to tabs
    let newTabs = [...orderedTabKeys];
    newTabs.push(newTabKey);

    // add new file to sources - newTabIndex is the new file tabOrder as displayed in the editor
    setSource(filename, fileContents, newTabIndex);
    projectChanged();
    setAllEditorMetadata(newFileMetadata, newTabs, newTabKey, newTabIndex);

    // add new tab and set it as the active tab
    closeEditorDialog();
    clearNewFileError();
  }

  onDeleteFile() {
    const {fileToDelete} = this.state;
    const {
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      removeFile,
      setAllEditorMetadata,
    } = this.props;
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

      setAllEditorMetadata(newFileMetadata, newTabs, newActiveTabKey);
      // delete from sources
      removeFile(fileMetadata[fileToDelete]);
      this.updateFileOrder();
    }

    this.props.closeEditorDialog();
    this.setState({
      showMenu: false,
      contextTarget: null,
      fileToDelete: null,
    });
  }

  onImportFile(filename, fileContents, tabOrder) {
    const {fileMetadata, orderedTabKeys} = this.props;
    // If filename already exists in sources, replace file contents.
    // Otherwise, create a new file.
    if (Object.keys(this.props.sources).includes(filename)) {
      // find editor for filename and overwrite contents of that editor
      let editorKey = null;
      for (const key in fileMetadata) {
        if (fileMetadata[key] === filename) {
          editorKey = key;
        }
      }
      const editor = this.editors[editorKey];
      editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: fileContents},
      });
      const tabOrder = orderedTabKeys.indexOf(editorKey);
      this.props.setSource(filename, fileContents, tabOrder);
    } else {
      // create new file
      this.onCreateFile(filename, fileContents);
    }
    projectChanged();
  }

  duplicateFileError(filename) {
    return javalabMsg.duplicateProjectFilenameError({filename: filename});
  }

  duplicateSupportFileError(filename) {
    return javalabMsg.duplicateSupportFilenameError({filename: filename});
  }

  /**
   * Checks if the new file name already exists in the project in both user and support code.
   * Returns the appropriate error message if so.
   */
  checkDuplicateFileName(newFilename) {
    if (Object.keys(this.props.sources).includes(newFilename)) {
      return this.props.sources[newFilename].isVisible
        ? this.duplicateFileError(newFilename)
        : this.duplicateSupportFileError(newFilename);
    } else if (Object.keys(this.props.validation).includes(newFilename)) {
      return this.duplicateSupportFileError(newFilename);
    }
  }

  // This is called from the file explorer when we want to jump to a file
  onOpenFile(key) {
    const {orderedTabKeys, setOrderedTabKeys, setActiveTabKey} = this.props;
    let newTabs = [...orderedTabKeys];
    let selectedFileIndex = newTabs.indexOf(key);
    newTabs.splice(selectedFileIndex, 1);
    newTabs.unshift(key);

    setActiveTabKey(key);
    setOrderedTabKeys(newTabs);
    this.updateFileOrder();

    // closes the tab menu if it is open
    this.setState({
      showMenu: false,
      contextTarget: null,
    });
  }

  editorHeaderText = () =>
    this.props.isReadOnlyWorkspace
      ? i18n.readonlyWorkspaceHeader()
      : javalabMsg.editor();

  render() {
    const {fileToDelete, contextTarget} = this.state;
    const {
      onCommitCode,
      displayTheme,
      sources,
      isEditingStartSources,
      isReadOnlyWorkspace,
      hasOpenCodeReview,
      isViewingOwnProject,
      height,
      isProjectTemplateLevel,
      handleClearPuzzle,
      orderedTabKeys,
      fileMetadata,
      activeTabKey,
      editTabKey,
      codeOwnersName,
    } = this.props;

    const showOpenCodeReviewWarning =
      isReadOnlyWorkspace && hasOpenCodeReview && !hasQueryParam('version');

    let menuStyle = {
      display: this.state.showMenu ? 'block' : 'none',
      position: 'fixed',
      top: this.state.menuPosition.top,
      left: this.state.menuPosition.left,
      backgroundColor: '#F0F0F0',
      zIndex: 1000,
    };
    return (
      <CloseOnEscape handleClose={this.cancelTabMenu}>
        <JavalabEditorHeader onBackpackImportFile={this.onImportFile} />
        <Tab.Container
          activeKey={activeTabKey}
          onSelect={key => this.onChangeTabs(key)}
          id="javalab-editor-tabs"
          className={displayTheme === DisplayTheme.DARK ? 'darkmode' : ''}
        >
          <div>
            <Nav bsStyle="tabs" className={style.tabs}>
              <JavalabFileExplorer
                fileMetadata={fileMetadata}
                onSelectFile={this.onOpenFile}
                displayTheme={displayTheme}
              />
              {orderedTabKeys.map(tabKey => {
                return (
                  <NavItem eventKey={tabKey} key={`${tabKey}-tab`}>
                    {isEditingStartSources && (
                      <FontAwesome
                        className={style.fileTypeIcon}
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
                        className={style.fileTypeIcon}
                        icon={'file-text'}
                      />
                    )}
                    <span>{fileMetadata[tabKey]}</span>
                    {activeTabKey === tabKey && !isReadOnlyWorkspace && (
                      <button
                        aria-label={i18n.fileOptions()}
                        aria-expanded={contextTarget === tabKey}
                        ref={`${tabKey}-file-toggle`}
                        type="button"
                        className={classNames(
                          'no-focus-outline',
                          style.fileMenuToggleButton,
                          displayTheme === DisplayTheme.DARK &&
                            style.darkFileMenuToggleButton
                        )}
                        onClick={e => this.toggleTabMenu(tabKey, e)}
                      >
                        <FontAwesome
                          icon={
                            contextTarget === tabKey ? 'caret-up' : 'caret-down'
                          }
                        />
                      </button>
                    )}
                  </NavItem>
                );
              })}
            </Nav>
            <div style={menuStyle}>
              <JavalabEditorTabMenu
                activeTabKey={activeTabKey}
                orderedTabKeys={orderedTabKeys}
                cancelTabMenu={this.cancelTabMenu}
                moveTabLeft={this.moveTabLeft}
                moveTabRight={this.moveTabRight}
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
            <Tab.Content id="tab-content" animation={false}>
              {showOpenCodeReviewWarning && (
                <div
                  id="openCodeReviewWarningBanner"
                  className={style.warningBanner}
                >
                  {isViewingOwnProject
                    ? javalabMsg.editingDisabledUnderReview()
                    : javalabMsg.codeReviewingPeer({
                        peerName: codeOwnersName,
                      })}
                </div>
              )}
              {isEditingStartSources && (
                <div
                  id="startSourcesWarningBanner"
                  className={style.warningBanner}
                >
                  {isProjectTemplateLevel
                    ? javalabMsg.startSourcesTemplateWarning()
                    : javalabMsg.inStartSourcesMode()}
                </div>
              )}
              {orderedTabKeys.map(tabKey => {
                return (
                  <Tab.Pane eventKey={tabKey} key={`${tabKey}-content`}>
                    <div
                      ref={el => (this._codeMirrors[tabKey] = el)}
                      className={classNames(
                        style.editor,
                        displayTheme === DisplayTheme.DARK &&
                          style.darkBackground,
                        'codemirror-container'
                      )}
                      style={{height: height - HEADER_OFFSET}}
                    />
                  </Tab.Pane>
                );
              })}
            </Tab.Content>
          </div>
        </Tab.Container>
        <JavalabEditorDialogManager
          onDeleteFile={this.onDeleteFile}
          filenameToDelete={fileMetadata[fileToDelete]}
          onRenameFile={this.onRenameFile}
          filenameToRename={fileMetadata[editTabKey]}
          onCreateFile={this.onCreateFile}
          onCommitCode={onCommitCode}
          handleClearPuzzle={handleClearPuzzle}
          isProjectTemplateLevel={isProjectTemplateLevel}
        />
      </CloseOnEscape>
    );
  }
}

export default connect(
  state => ({
    sources: state.javalabEditor.sources,
    validation: state.javalabEditor.validation,
    displayTheme: state.javalabView.displayTheme,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isReadOnlyWorkspace: state.javalab.isReadOnlyWorkspace,
    hasOpenCodeReview: state.javalab.hasOpenCodeReview,
    isViewingOwnProject: state.pageConstants.isViewingOwnProject,
    codeOwnersName: state.pageConstants.codeOwnersName,
    fileMetadata: state.javalabEditor.fileMetadata,
    orderedTabKeys: state.javalabEditor.orderedTabKeys,
    activeTabKey: state.javalabEditor.activeTabKey,
    lastTabKeyIndex: state.javalabEditor.lastTabKeyIndex,
    editTabKey: state.javalabEditor.editTabKey,
    editorFontSize: state.javalabView.editorFontSize,
  }),
  dispatch => ({
    setSource: (filename, source, tabOrder) =>
      dispatch(setSource(filename, source, tabOrder)),
    sourceFileOrderUpdated: () => dispatch(sourceFileOrderUpdated()),
    sourceVisibilityUpdated: (filename, isVisible) =>
      dispatch(sourceVisibilityUpdated(filename, isVisible)),
    sourceValidationUpdated: (filename, isValidation) =>
      dispatch(sourceValidationUpdated(filename, isValidation)),
    sourceTextUpdated: (filename, text) =>
      dispatch(sourceTextUpdated(filename, text)),
    renameFile: (oldFilename, newFilename) =>
      dispatch(renameFile(oldFilename, newFilename)),
    removeFile: filename => dispatch(removeFile(filename)),
    setRenderedHeight: height => dispatch(setRenderedHeight(height)),
    setEditorColumnHeight: height => dispatch(setEditorColumnHeight(height)),
    setEditTabKey: tabKey => dispatch(setEditTabKey(tabKey)),
    setActiveTabKey: tabKey => dispatch(setActiveTabKey(tabKey)),
    setOrderedTabKeys: orderedTabKeys =>
      dispatch(setOrderedTabKeys(orderedTabKeys)),
    setFileMetadata: fileMetadata => dispatch(setFileMetadata(fileMetadata)),
    setAllEditorMetadata: (
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      lastTabKeyIndex
    ) =>
      dispatch(
        setAllEditorMetadata(
          fileMetadata,
          orderedTabKeys,
          activeTabKey,
          lastTabKeyIndex
        )
      ),
    openEditorDialog: dialogName => dispatch(openEditorDialog(dialogName)),
    closeEditorDialog: () => dispatch(closeEditorDialog()),
    setNewFileError: error => dispatch(setNewFileError(error)),
    clearNewFileError: () => dispatch(clearNewFileError()),
    setRenameFileError: error => dispatch(setRenameFileError(error)),
    clearRenameFileError: () => dispatch(clearRenameFileError()),
  })
)(JavalabEditor);
