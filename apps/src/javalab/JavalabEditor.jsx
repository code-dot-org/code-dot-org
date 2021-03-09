import React from 'react';
import {connect} from 'react-redux';
import {setEditorText, setFileName} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {EditorView} from '@codemirror/view';
import {editorSetup} from './editorSetup';
import {EditorState} from '@codemirror/state';

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
  }
};

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    // populated by redux
    editorText: PropTypes.string,
    setEditorText: PropTypes.func,
    fileName: PropTypes.string,
    setFileName: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      renameFileActive: false,
      showFileManagementPanel: false
    };
  }

  componentDidMount() {
    this.editor = new EditorView({
      state: EditorState.create({
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

  displayFileRename() {
    return (
      <div style={style.tabs}>
        <div style={style.tab}>
          <input
            type="text"
            ariaLabel="file name"
            value={this.props.fileName}
            onChange={e => this.props.setFileName(e.target.value)}
            onBlur={() => this.setState({renameFileActive: false})}
          />
        </div>
        <button
          type="button"
          onClick={() => this.setState({renameFileActive: false})}
          className="btn btn-default btn-sm"
          style={style.button}
        >
          Save
        </button>
      </div>
    );
  }

  displayFileNameAndRenameButton() {
    return (
      <div style={style.tabs}>
        <div style={style.tab}>{this.props.fileName}</div>
        <button
          type="button"
          onClick={() => this.setState({renameFileActive: true})}
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
    editorText: state.javalab.editorText,
    fileName: state.javalab.fileName
  }),
  dispatch => ({
    setEditorText: editorText => dispatch(setEditorText(editorText)),
    setFileName: fileName => dispatch(setFileName(fileName))
  })
)(JavalabEditor);
