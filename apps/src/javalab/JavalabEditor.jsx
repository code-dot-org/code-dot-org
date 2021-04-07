import React from 'react';
import {connect} from 'react-redux';
import {setEditorText, setFileName} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import {EditorView} from '@codemirror/view';
import {editorSetup, lightMode} from './editorSetup';
import {EditorState, tagExtension} from '@codemirror/state';
import {renameProjectFile, onProjectChanged} from './JavalabFileManagement';
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
    padding: 10
  },
  button: {
    marginLeft: 10
  },
  renameForm: {
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center'
  }
};

const darkTabColor = '#282c34';

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onCommitCode: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    // populated by redux
    setEditorText: PropTypes.func,
    setFilename: PropTypes.func,
    filename: PropTypes.string,
    editorText: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.activateRenameFile = this.activateRenameFile.bind(this);
    this.renameFileComplete = this.renameFileComplete.bind(this);
    this.onProjectChanged = onProjectChanged.bind(this);

    this.state = {
      renameFileActive: false,
      showFileManagementPanel: false,
      newFilename: null
    };
  }

  componentDidMount() {
    const {isDarkMode} = this.props;
    const extensions = [...editorSetup];

    if (isDarkMode) {
      extensions.push(tagExtension('style', oneDark));
    } else {
      extensions.push(tagExtension('style', lightMode));
    }
    this.editor = new EditorView({
      state: EditorState.create({
        doc: this.props.editorText,
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
        this.props.setEditorText(tr.newDoc.toString());
        this.onProjectChanged();
      }
    };
  };

  renameFileComplete(e) {
    e.preventDefault();
    const {filename, setFilename} = this.props;
    const {newFilename} = this.state;
    renameProjectFile(filename, newFilename);
    setFilename(newFilename);
    this.onProjectChanged();
    this.setState({renameFileActive: false});
  }

  activateRenameFile() {
    this.setState({newFilename: this.props.filename, renameFileActive: true});
  }

  displayFileRename() {
    return (
      <div style={style.tabs}>
        <form style={style.renameForm} onSubmit={this.renameFileComplete}>
          <div
            style={{
              ...style.tab,
              backgroundColor: this.props.isDarkMode
                ? darkTabColor
                : color.white
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
            backgroundColor: this.props.isDarkMode ? darkTabColor : color.white
          }}
        >
          {this.props.filename}
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
            backgroundColor: this.props.isDarkMode ? darkTabColor : color.white
          }}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    filename: state.javalab.filename,
    editorText: state.javalab.editorText
  }),
  dispatch => ({
    setFilename: filename => dispatch(setFileName(filename)),
    setEditorText: editorText => dispatch(setEditorText(editorText))
  })
)(JavalabEditor);
