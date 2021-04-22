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
import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {oneDark} from '@codemirror/theme-one-dark';
import color from '@cdo/apps/util/color';
import {Tab, Nav, NavItem} from 'react-bootstrap';
import JavalabEditorTabMenu from './JavalabEditorTabMenu';
import JavalabFileExplorer from './JavalabFileExplorer';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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
    margin: '0px 0px 0px 4px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    ':hover': {
      cursor: 'pointer',
      boxShadow: 'none'
    }
  },
  darkFileMenuToggleButton: {
    color: color.white
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

    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.openTabMenu = this.openTabMenu.bind(this);
    this.renameFromTabMenu = this.renameFromTabMenu.bind(this);
    this.cancelTabMenu = this.cancelTabMenu.bind(this);
    this.onRenameFile = this.onRenameFile.bind(this);
    this.onOpenFile = this.onOpenFile.bind(this);

    let tabs = [];
    // TODO: remove isOriginal once we have editors for each file
    Object.keys(props.sources).forEach((file, index) => {
      tabs.push({
        filename: file,
        key: `file-${index}`,
        isOriginal: true
      });
    });
    tabs.push({
      filename: 'FakeFile.java',
      key: 'file-1',
      isOriginal: false
    });
    this.state = {
      tabs,
      showMenu: false,
      contextTarget: null,
      dialogOpen: false,
      menuPosition: {},
      editTabKey: null,
      editTabFilename: null,
      activeTabKey: tabs[0].key
    };
  }

  componentDidMount() {
    // TODO: support multi-file
    const filename = Object.keys(this.props.sources)[0];
    let doc = this.props.sources[filename].text;
    const {isDarkMode} = this.props;
    const extensions = [...editorSetup];

    if (isDarkMode) {
      extensions.push(tagExtension('style', oneDark));
    } else {
      extensions.push(tagExtension('style', lightMode));
    }
    this.editor = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: extensions
      }),
      parent: this._codeMirror,
      dispatch: this.dispatchEditorChange()
    });
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

  openTabMenu(key, e) {
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

  renameFromTabMenu() {
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

  cancelTabMenu() {
    this.setState({
      showMenu: false,
      contextTarget: null
    });
  }

  componentDidUpdate(prevProps) {
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
  }

  dispatchEditorChange = () => {
    // tr is a code mirror transaction
    // see https://codemirror.net/6/docs/ref/#state.Transaction
    return tr => {
      // we are overwriting the default dispatch method for codemirror,
      // so we need to manually call the update method.
      this.editor.update([tr]);
      // if there are changes to the editor, update redux.
      if (!tr.changes.empty && tr.newDoc) {
        this.props.setSource(
          Object.keys(this.props.sources)[0],
          tr.newDoc.toString()
        );
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
    const {sources, renameFile} = this.props;
    const filename = Object.keys(sources)[0];
    renameFile(filename, newFilename);
    projectChanged();
    this.setState({tabs: newTabs, dialogOpen: false});
  }

  onOpenFile(key) {
    const {tabs} = this.state;
    let newTabs = [...tabs];
    let selectedFileIndex;
    let selectedFile;
    newTabs.forEach((tab, index) => {
      if (tab.key === key) {
        selectedFileIndex = index;
        selectedFile = tab;
      }
    });
    newTabs.splice(selectedFileIndex, 1);
    newTabs.unshift(selectedFile);
    this.setState({activeTabKey: key, tabs: newTabs});
  }

  render() {
    const {tabs, editTabFilename, activeTabKey, contextTarget} = this.state;

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
          activeKey={activeTabKey}
          onSelect={key => this.onChangeTabs(key)}
          style={{marginTop: 10}}
          id="javalab-editor-tabs"
          className={this.props.isDarkMode ? 'darkmode' : ''}
        >
          <div>
            <Nav bsStyle="tabs" style={{marginBottom: 0}}>
              <JavalabFileExplorer
                files={tabs}
                onSelectFile={this.onOpenFile}
                isDarkMode={this.props.isDarkMode}
              />
              {tabs.map(tab => {
                return (
                  <NavItem eventKey={tab.key} key={`${tab.key}-tab`}>
                    <span>{tab.filename}</span>
                    {activeTabKey === tab.key && (
                      <button
                        type="button"
                        style={{
                          ...style.fileMenuToggleButton,
                          ...(this.props.isDarkMode &&
                            style.darkFileMenuToggleButton)
                        }}
                        onClick={e => this.openTabMenu(tab.key, e)}
                        className="no-focus-outline"
                      >
                        <FontAwesome
                          icon={
                            contextTarget === tab.key
                              ? 'caret-up'
                              : 'caret-down'
                          }
                        />
                      </button>
                    )}
                  </NavItem>
                );
              })}
            </Nav>
            <Tab.Content animation={false}>
              {tabs.map(tab => {
                return (
                  <Tab.Pane eventKey={tab.key} key={`${tab.key}-content`}>
                    {tab.isOriginal ? ( // TODO: remove isOriginal once we have editors for each file
                      <div
                        ref={el => (this._codeMirror = el)}
                        style={{
                          ...style.editor,
                          ...(this.props.isDarkMode && style.darkBackground)
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          ...style.editor,
                          ...(this.props.isDarkMode && style.darkBackground)
                        }}
                      >
                        Content {tab.filename}
                      </div>
                    )}
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
          />
        </div>
        <FileRenameDialog
          isOpen={this.state.dialogOpen}
          handleClose={() => this.setState({dialogOpen: false})}
          filename={editTabFilename}
          handleRename={this.onRenameFile}
          isDarkMode={this.props.isDarkMode}
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
