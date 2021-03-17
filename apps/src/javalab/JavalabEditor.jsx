import React from 'react';
import {connect} from 'react-redux';
import {setEditorText, setFileName} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import {EditorView} from '@codemirror/view';
import {editorSetup} from './editorSetup';
import {EditorState} from '@codemirror/state';
import {renameProjectFile, onSave} from './JavalabFileManagement';

const style = {
  editor: {
    width: '100%',
    height: 400,
    backgroundColor: '#282c34'
  },
  tabs: {
    display: 'flex'
  },
  tab: {
    backgroundColor: '#282c34',
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

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
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
    this.onSave = onSave.bind(this);

    this.state = {
      renameFileActive: false,
      showFileManagementPanel: false,
      oldFilename: null
    };
  }

  componentDidMount() {
    this.editor = new EditorView({
      state: EditorState.create({
        doc: this.props.editorText,
        extensions: editorSetup
      }),
      parent: this._codeMirror,
      dispatch: this.dispatchEditorChange()
    });
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
      }
    };
  };

  renameFileComplete(e) {
    e.preventDefault();
    renameProjectFile(this.state.oldFilename, this.props.filename);
    this.setState({renameFileActive: false});
  }

  activateRenameFile() {
    this.setState({oldFilename: this.props.filename, renameFileActive: true});
  }

  displayFileRename() {
    return (
      <div style={style.tabs}>
        <form style={style.renameForm} onSubmit={this.renameFileComplete}>
          <div style={style.tab}>
            <input
              type="text"
              value={this.props.filename}
              onChange={e => this.props.setFilename(e.target.value)}
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
        <div style={style.tab}>{this.props.filename}</div>
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
            onClick={this.onSave}
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
        <div ref={el => (this._codeMirror = el)} style={style.editor} />
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
