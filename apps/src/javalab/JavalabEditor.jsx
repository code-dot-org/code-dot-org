import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {setSource, renameFile} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import {EditorView} from '@codemirror/view';
import {editorSetup, lightMode} from './editorSetup';
import {EditorState, tagExtension} from '@codemirror/state';
import FileRenameDialog from './FileRenameDialog';
import CreateFileDialog from './CreateFileDialog';
import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {oneDark} from '@codemirror/theme-one-dark';
import color from '@cdo/apps/util/color';
import {Tab, Nav, NavItem} from 'react-bootstrap';
import JavalabEditorContextMenu from './JavalabEditorContextMenu';

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
    sources: PropTypes.object,
    isDarkMode: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.renameFromContextMenu = this.renameFromContextMenu.bind(this);
    this.cancelContextMenu = this.cancelContextMenu.bind(this);
    this.onRenameFile = this.onRenameFile.bind(this);
    this.onCreateFile = this.onCreateFile.bind(this);
    this._codeMirrors = {};

    let tabs = [];
    // TODO: remove isOriginal once we have editors for each file
    Object.keys(props.sources).forEach((file, index) => {
      tabs.push({
        filename: file,
        key: `file-${index}`
      });
    });
    this.state = {
      tabs,
      showMenu: false,
      contextTarget: null,
      dialogOpen: false,
      menuPosition: {},
      editTabKey: null,
      editTabFilename: null,
      newFileDialogOpen: false,
      newFileError: null
    };
  }

  componentDidMount() {
    this.editors = {};
    const {sources} = this.props;
    Object.keys(sources).forEach(filename => {
      this.createEditor(filename, sources[filename].text);
    });
  }

  createEditor(filename, doc) {
    const {isDarkMode} = this.props;
    const extensions = [...editorSetup];

    if (isDarkMode) {
      extensions.push(tagExtension('style', oneDark));
    } else {
      extensions.push(tagExtension('style', lightMode));
    }
    this.editors[filename] = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: extensions
      }),
      parent: this._codeMirrors[filename],
      dispatch: this.dispatchEditorChange(filename)
    });
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
    let filename;
    this.state.tabs.forEach(tab => {
      if (tab.key === this.state.contextTarget) {
        filename = tab.filename;
      }
    });

    this.setState({
      showMenu: false,
      contextTarget: null,
      editTabKey: this.state.contextTarget,
      editTabFilename: filename,
      dialogOpen: true
    });
  }

  cancelContextMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null
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
        if (!this.editors[tab.filename]) {
          const source = this.props.sources[tab.filename];
          const doc = (source && source.text) || '';
          this.createEditor(tab.filename, doc);
        }
      });
    }
  }

  dispatchEditorChange = filename => {
    // tr is a code mirror transaction
    // see https://codemirror.net/6/docs/ref/#state.Transaction
    return tr => {
      // we are overwriting the default dispatch method for codemirror,
      // so we need to manually call the update method.
      this.editors[filename].update([tr]);
      // if there are changes to the editor, update redux.
      if (!tr.changes.empty && tr.newDoc) {
        this.props.setSource(filename, tr.newDoc.toString());
        projectChanged();
      }
    };
  };

  onRenameFile(newFilename) {
    const newTabs = this.state.tabs.map(tab => {
      if (tab.key === this.state.editTabKey) {
        tab.filename = newFilename;
      }
      return tab;
    });
    const {renameFile} = this.props;
    renameFile(this.state.editTabFilename, newFilename);
    projectChanged();
    this.setState({tabs: newTabs, dialogOpen: false});
  }

  onCreateFile(filename) {
    const {sources} = this.props;
    if (Object.keys(sources).includes(filename)) {
      this.setState({
        newFileError: `You already have a file named ${filename}. Please choose a different name`
      });
      return;
    }

    this.setState({newFileError: null});
    let newTabs = [...this.state.tabs];
    const newIndex = newTabs.length;
    newTabs.push({
      filename: filename,
      key: `file-${newIndex}`
    });
    this.setState({tabs: newTabs});
    this.props.setSource(filename, '');
    projectChanged();

    this.setState({newFileDialogOpen: false});
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
          defaultActiveKey="file-0"
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
                    {/*TODO: make this an input on rename/new file? */}
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
                      ref={el => (this._codeMirrors[tab.filename] = el)}
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
          />
        </div>
        <FileRenameDialog
          isOpen={this.state.dialogOpen}
          handleClose={() => this.setState({dialogOpen: false})}
          filename={editTabFilename}
          handleRename={this.onRenameFile}
          isDarkMode={this.props.isDarkMode}
        />
        <CreateFileDialog
          isOpen={this.state.newFileDialogOpen}
          handleClose={() => this.setState({newFileDialogOpen: false})}
          handleCreate={this.onCreateFile}
          isDarkMode={this.props.isDarkMode}
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
      dispatch(renameFile(oldFilename, newFilename))
  })
)(Radium(JavalabEditor));
