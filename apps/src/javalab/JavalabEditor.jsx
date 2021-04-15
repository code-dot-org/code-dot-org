import React from 'react';
import {connect} from 'react-redux';
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
import {Tabs, Tab} from 'react-draggable-tab';
import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {oneDark} from '@codemirror/theme-one-dark';
import color from '@cdo/apps/util/color';

const style = {
  editor: {
    width: '100%',
    height: 400
  },
  anchor: {
    padding: 10,
    color: color.charcoal,
    backgroundColor: color.white,
    fontFamily: '"Gotham 5r", sans-serif',
    display: 'block',
    textDecoration: 'none',
    lineHeight: '20px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    }
  },
  nonFirstAnchor: {
    borderTop: `1px solid ${color.charcoal}`
  },
  tab: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: color.white
  },
  button: {
    marginLeft: 10
  },
  renameForm: {
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center'
  },
  darkBackground: {
    backgroundColor: '#282c34'
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

    //this.renameFileComplete = this.renameFileComplete.bind(this);
    let tabs = [];
    Object.keys(props.sources).forEach((file, index) => {
      tabs.push({
        filename: file,
        key: `file-${index}`
      });
    });
    this.state = {
      renameFileActive: false,
      showFileManagementPanel: false,
      newFilename: null,
      tabs,
      showMenu: false,
      contextTarget: null,
      dialogOpen: false,
      menuPosition: {}
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

  makeListeners(key) {
    return {
      onDoubleClick: e => {
        this.handleTabDoubleClick(key, e);
      },
      onContextMenu: e => {
        this.handleTabContextMenu(key, e);
      }
    };
  }

  handleTabSelect(e, key, currentTabs) {
    const tabs = currentTabs.map(tab => {
      return {
        key: tab.key,
        filename: tab.props.title
      };
    });
    this.setState({selectedTab: key, tabs});
  }

  handleTabClose(e, key, currentTabs) {
    const tabs = currentTabs.map(tab => {
      return {
        key: tab.key,
        filename: tab.props.title
      };
    });
    this.setState({tabs});
  }

  handleTabPositionChange(e, key, currentTabs) {
    const tabs = currentTabs.map(tab => {
      return {
        key: tab.key,
        filename: tab.props.title
      };
    });
    this.setState({tabs});
  }

  handleTabAddButtonClick(e, currentTabs) {
    // key must be unique
    const key = 'newTab_' + Date.now();
    let newTab = {
      key,
      filename: 'untitled'
    };
    const tabs = currentTabs.map(tab => {
      return {
        key: tab.key,
        filename: tab.props.title
      };
    });
    let newTabs = tabs.concat([newTab]);

    this.setState({
      tabs: newTabs,
      selectedTab: key
    });
  }

  handleTabDoubleClick(key) {
    let filename;
    this.state.tabs.forEach(tab => {
      if (tab.key === key) {
        filename = tab.filename;
      }
    });
    this.setState({
      editTabKey: key,
      editTabFilename: filename,
      dialogOpen: true
    });
  }

  handleTabContextMenu(key, e) {
    e.preventDefault();
    const boundingRect = e.target.getBoundingClientRect();
    this.setState({
      showMenu: true,
      contextTarget: key,
      menuPosition: {
        // Add 10 to offset the 10px padding on the tab title element.
        top: `${boundingRect.bottom + 10}px`,
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
            id="javalab-editor-save"
            iconClass="fa fa-check-circle"
            onClick={this.props.onCommitCode}
            headerHasFocus={true}
            isRtl={false}
            label="Commit Code"
          />
          <PaneSection>Editor</PaneSection>
        </PaneHeader>
        <Tabs
          selectedTab={
            this.state.selectedTab
              ? this.state.selectedTab
              : tabs
              ? tabs[0].key
              : ''
          }
          onTabSelect={this.handleTabSelect.bind(this)}
          onTabAddButtonClick={this.handleTabAddButtonClick.bind(this)}
          onTabPositionChange={this.handleTabPositionChange.bind(this)}
          tabs={tabs.map(tab => (
            <Tab
              key={tab.key}
              title={tab.filename}
              disableClose
              {...this.makeListeners(tab.key)}
            >
              <div
                ref={el => (this._codeMirror = el)}
                style={{
                  ...style.editor,
                  ...(this.props.isDarkMode && style.darkBackground)
                }}
              />
              {/*TODO: We'll want to make a separate editor for each file*/}
            </Tab>
          ))}
          shortCutKeys={{
            close: ['alt+command+w', 'alt+ctrl+w'],
            create: ['alt+command+t', 'alt+ctrl+t'],
            moveRight: ['alt+command+tab', 'alt+ctrl+tab'],
            moveLeft: ['shift+alt+command+tab', 'shift+alt+ctrl+tab']
          }}
          keepSelectedTab={true}
        />
        <div style={menuStyle}>
          <a
            key="rename"
            onClick={this.renameFromContextMenu.bind(this)}
            style={style.anchor}
          >
            Rename
          </a>
          <a
            key="cancel"
            onClick={this.cancelContextMenu.bind(this)}
            style={{...style.nonFirstAnchor, ...style.anchor}}
          >
            Cancel
          </a>
        </div>
        <FileRenameDialog
          isOpen={this.state.dialogOpen}
          handleClose={() => this.setState({dialogOpen: false})}
          filename={editTabFilename}
          handleRename={this.onRenameFile.bind(this)}
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
)(JavalabEditor);
