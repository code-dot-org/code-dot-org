import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {setSource, renameFile, removeFile} from './javalabRedux';
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
import JavalabEditorContextMenu from './JavalabEditorContextMenu';
import NameFileDialog from './NameFileDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const style = {
  editor: {
    width: '100%',
    height: 400,
    backgroundColor: color.white
  },
  darkBackground: {
    backgroundColor: color.dark_slate_gray
  }
};

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onCommitCode: PropTypes.func.isRequired,
    // populated by redux
    setSource: PropTypes.func,
    renameFile: PropTypes.func,
    removeFile: PropTypes.func,
    sources: PropTypes.object,
    isDarkMode: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.renameFromContextMenu = this.renameFromContextMenu.bind(this);
    this.cancelContextMenu = this.cancelContextMenu.bind(this);
    this.deleteFromContextMenu = this.deleteFromContextMenu.bind(this);
    this.onRenameFile = this.onRenameFile.bind(this);
    this.onCreateFile = this.onCreateFile.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this._codeMirrors = {};

    let tabs = [];
    let tabKeysToFilenames = {};
    Object.keys(props.sources).forEach((file, index) => {
      let tabKey = this.getTabKey(index);
      tabs.push({
        filename: file,
        key: tabKey
      });
      tabKeysToFilenames[tabKey] = file;
    });

    const firstTabKey = tabs.length > 0 ? tabs[0].key : null;

    this.state = {
      tabs,
      tabKeysToFilenames,
      showMenu: false,
      contextTarget: null,
      renameDialogOpen: false,
      menuPosition: {},
      editTabKey: null,
      editTabFilename: null,
      newFileDialogOpen: false,
      newFileError: null,
      renameFileError: null,
      activeTabKey: firstTabKey,
      lastTabKeyIndex: tabs.length - 1,
      confirmDeleteDialogOpen: false,
      fileToDelete: null
    };
  }

  componentDidMount() {
    this.editors = {};
    const {sources} = this.props;
    this.state.tabs.forEach(tab => {
      this.createEditor(tab.key, sources[tab.filename].text);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isDarkMode !== this.props.isDarkMode) {
      if (this.props.isDarkMode) {
        this.editor.dispatch({
          reconfigure: {style: oneDark}
        });
      } else {
        this.editor.dispatch({
          reconfigure: {style: lightMode}
        });
      }
    }
    if (prevState.tabs.length !== this.state.tabs.length) {
      this.state.tabs.forEach(tab => {
        // create codemirror for a new tab
        if (!this.editors[tab.key]) {
          const source = this.props.sources[tab.filename];
          const doc = (source && source.text) || '';
          this.createEditor(tab.key, doc);
        }
      });
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
          this.state.tabKeysToFilenames[key],
          tr.newDoc.toString()
        );
        projectChanged();
      }
    };
  };

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

  openTabContextMenu(key, e) {
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

  renameFromContextMenu() {
    const filename = this.state.tabKeysToFilenames[this.state.contextTarget];

    this.setState({
      showMenu: false,
      contextTarget: null,
      editTabKey: this.state.contextTarget,
      editTabFilename: filename,
      renameDialogOpen: true
    });
  }

  cancelContextMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null
    });
  }

  deleteFromContextMenu() {
    const filename = this.state.tabKeysToFilenames[this.state.contextTarget];

    this.setState({
      confirmDeleteDialogOpen: true,
      fileToDelete: filename
    });
  }

  onRenameFile(newFilename) {
    // check for duplicate filename
    if (Object.keys(this.props.sources).includes(newFilename)) {
      this.setState({
        renameFileError: this.duplicateFileError(newFilename)
      });
      return;
    }

    // update tab with new filename
    const newTabs = this.state.tabs.map(tab => {
      if (tab.key === this.state.editTabKey) {
        tab.filename = newFilename;
      }
      return tab;
    });

    // update tab to filename map with new filename
    const newTabKeyMap = {...this.state.tabKeysToFilenames};
    newTabKeyMap[this.state.editTabKey] = newFilename;

    const {renameFile} = this.props;
    renameFile(this.state.editTabFilename, newFilename);
    projectChanged();
    this.setState({
      tabs: newTabs,
      tabKeysToFilenames: newTabKeyMap,
      renameDialogOpen: false,
      renameFileError: null
    });
  }

  onCreateFile(filename) {
    const {sources} = this.props;
    if (Object.keys(sources).includes(filename)) {
      this.setState({
        newFileError: this.duplicateFileError(filename)
      });
      return;
    }

    this.setState({newFileError: null});
    let newTabs = [...this.state.tabs];
    const newTabIndex = this.state.lastTabKeyIndex + 1;
    const newTabKey = this.getTabKey(newTabIndex);

    // update tab to filename map with new file
    const newTabKeyMap = {...this.state.tabKeysToFilenames};
    newTabKeyMap[newTabKey] = filename;

    newTabs.push({
      filename: filename,
      key: newTabKey
    });

    // add new file to sources
    this.props.setSource(filename, '');
    projectChanged();

    // add new tab and set it as the active tab
    this.setState({
      tabs: newTabs,
      tabKeysToFilenames: newTabKeyMap,
      activeTabKey: newTabKey,
      lastTabKeyIndex: newTabIndex,
      newFileDialogOpen: false,
      newFileError: null
    });
  }

  onDeleteFile() {
    let tabToDelete;
    let indexToRemove = -1;
    // find tab in list
    this.state.tabs.forEach((tab, index) => {
      if (tab.filename === this.state.fileToDelete) {
        indexToRemove = index;
        tabToDelete = tab.key;
      }
    });

    if (indexToRemove >= 0) {
      // delete from tabs
      let newTabs = [...this.state.tabs];
      newTabs.splice(indexToRemove, 1);
      let newActiveTabKey = this.state.activeTabKey;
      // we need to update the active tab if we are deleting the currently active tab
      if (this.state.activeTabKey === tabToDelete) {
        if (newTabs.length > 0) {
          // if there is still at least 1 file, go to first file
          newActiveTabKey = newTabs[0].key;
        } else {
          // otherwise wipe out active tab key
          newActiveTabKey = null;
        }
      }

      // delete tab key from tab to filename map
      const newTabKeyMap = {...this.state.tabKeysToFilenames};
      delete newTabKeyMap[tabToDelete];

      this.setState({
        tabs: newTabs,
        activeTabKey: newActiveTabKey,
        tabKeysToFilenames: newTabKeyMap
      });

      // delete from sources
      this.props.removeFile(this.state.fileToDelete);
      projectChanged();
    }

    this.setState({
      showMenu: false,
      contextTarget: null,
      confirmDeleteDialogOpen: false,
      fileToDelete: null
    });
  }

  duplicateFileError(filename) {
    return `Filename ${filename} is already in use in this project. Please choose a different name`;
  }

  render() {
    const {tabs, editTabFilename} = this.state;

    let menuStyle = {
      display: this.state.showMenu ? 'block' : 'none',
      position: 'fixed',
      top: this.state.menuPosition.top,
      left: this.state.menuPosition.left,
      backgroundColor: '#F0F0F0'
    };
    return (
      <div style={this.props.style}>
        <PaneHeader hasFocus={true}>
          <PaneButton
            id="javalab-editor-create-file"
            iconClass="fa fa-plus-circle"
            onClick={() => this.setState({newFileDialogOpen: true})}
            headerHasFocus={true}
            isRtl={false}
            label="Create File"
            leftJustified={true}
          />
          <PaneButton
            id="javalab-editor-save"
            iconClass="fa fa-check-circle"
            onClick={this.props.onCommitCode}
            headerHasFocus={true}
            isRtl={false}
            label="Commit Code"
          />
          <PaneSection>Editor</PaneSection>
        </PaneHeader>
        <Tab.Container
          activeKey={this.state.activeTabKey}
          onSelect={tabKey => this.setState({activeTabKey: tabKey})}
          style={{marginTop: 10}}
          id="javalab-editor-tabs"
          className={this.props.isDarkMode ? 'darkmode' : ''}
        >
          <div>
            <Nav bsStyle="tabs" style={{marginBottom: 0}}>
              {tabs.map(tab => {
                return (
                  <NavItem
                    eventKey={tab.key}
                    key={`${tab.key}-tab`}
                    {...this.makeListeners(tab.key)}
                  >
                    {tab.filename}
                  </NavItem>
                );
              })}
            </Nav>
            <Tab.Content animation={false}>
              {tabs.map(tab => {
                return (
                  <Tab.Pane eventKey={tab.key} key={`${tab.key}-content`}>
                    <div
                      ref={el => (this._codeMirrors[tab.key] = el)}
                      style={{
                        ...style.editor,
                        ...(this.props.isDarkMode && style.darkBackground)
                      }}
                    />
                  </Tab.Pane>
                );
              })}
            </Tab.Content>
          </div>
        </Tab.Container>
        <div style={menuStyle}>
          <JavalabEditorContextMenu
            cancelContextMenu={this.cancelContextMenu}
            renameFromContextMenu={this.renameFromContextMenu}
            deleteFromContextMenu={this.deleteFromContextMenu}
          />
        </div>
        <DeleteConfirmationDialog
          isOpen={this.state.confirmDeleteDialogOpen}
          handleConfirm={this.onDeleteFile}
          handleClose={() => this.setState({confirmDeleteDialogOpen: false})}
          filename={this.state.fileToDelete}
          isDarkMode={this.props.isDarkMode}
        />
        <NameFileDialog
          isOpen={this.state.renameDialogOpen}
          handleClose={() =>
            this.setState({renameDialogOpen: false, renameFileError: null})
          }
          filename={editTabFilename}
          handleSave={this.onRenameFile}
          isDarkMode={this.props.isDarkMode}
          inputLabel="Rename the file"
          saveButtonText="Rename"
          errorMessage={this.state.renameFileError}
        />
        <NameFileDialog
          isOpen={this.state.newFileDialogOpen}
          handleClose={() =>
            this.setState({newFileDialogOpen: false, newFileError: null})
          }
          handleSave={this.onCreateFile}
          isDarkMode={this.props.isDarkMode}
          inputLabel="Create new file"
          saveButtonText="Create"
          errorMessage={this.state.newFileError}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    sources: state.javalab.sources,
    isDarkMode: state.javalab.isDarkMode
  }),
  dispatch => ({
    setSource: (filename, source) => dispatch(setSource(filename, source)),
    renameFile: (oldFilename, newFilename) =>
      dispatch(renameFile(oldFilename, newFilename)),
    removeFile: filename => dispatch(removeFile(filename))
  })
)(Radium(JavalabEditor));
