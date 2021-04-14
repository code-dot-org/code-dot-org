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
import {projectChanged} from '@cdo/apps/code-studio/initApp/project';
import {oneDark} from '@codemirror/theme-one-dark';
import color from '@cdo/apps/util/color';

const style = {
  editor: {
    width: '100%',
    height: 400
  },
  tabs: {
    display: 'flex'
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

    this.activateRenameFile = this.activateRenameFile.bind(this);
    this.renameFileComplete = this.renameFileComplete.bind(this);

    this.state = {
      renameFileActive: false,
      showFileManagementPanel: false,
      newFilename: null
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

  renameFileComplete(e) {
    e.preventDefault();
    const {sources, renameFile} = this.props;
    const {newFilename} = this.state;
    const filename = Object.keys(sources)[0];
    renameFile(filename, newFilename);
    projectChanged();
    this.setState({renameFileActive: false});
  }

  activateRenameFile() {
    this.setState({
      newFilename: Object.keys(this.props.sources)[0],
      renameFileActive: true
    });
  }

  displayFileRename() {
    return (
      <div style={style.tabs}>
        <form style={style.renameForm} onSubmit={this.renameFileComplete}>
          <div
            style={{
              ...style.tab,
              ...(this.props.isDarkMode && style.darkBackground)
            }}
          >
            <input
              className="rename-file-input"
              type="text"
              value={this.state.newFilename}
              onChange={e => this.setState({newFilename: e.target.value})}
            />
          </div>
          <input
            className="btn btn-default btn-sm"
            style={style.button}
            type="submit"
            value="Save"
          />
        </form>
      </div>
    );
  }

  displayFileNameAndRenameButton() {
    return (
      <div style={style.tabs}>
        <div
          style={{
            ...style.tab,
            ...(this.props.isDarkMode && style.darkBackground)
          }}
        >
          {Object.keys(this.props.sources)[0]}
        </div>
        <button
          type="button"
          onClick={this.activateRenameFile}
          className="btn btn-default btn-sm"
          style={style.button}
        >
          Rename
        </button>
      </div>
    );
  }

  render() {
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
        <div>
          {this.state.renameFileActive
            ? this.displayFileRename()
            : this.displayFileNameAndRenameButton()}
        </div>
        <div
          ref={el => (this._codeMirror = el)}
          style={{
            ...style.editor,
            ...(this.props.isDarkMode && style.darkBackground)
          }}
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
