import React from 'react';
import $ from 'jquery';
import {connect} from 'react-redux';
import {setEditorText} from './javalabRedux';
import PropTypes from 'prop-types';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {EditorState, EditorView, basicSetup} from '@codemirror/basic-setup';
import {java} from '@codemirror/lang-java';
import {oneDarkTheme, oneDarkHighlightStyle} from '@codemirror/theme-one-dark';

const style = {
  editor: {
    width: '100%',
    height: 600,
    backgroundColor: '#282c34'
  }
};

class JavalabEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    // populated by redux
    editorText: PropTypes.string,
    setEditorText: PropTypes.func
  };

  onChange = newValue => {
    this.props.setEditorText(newValue);
  };

  componentDidMount() {
    let textInput = $('.ace_text-input');
    if (textInput) {
      let textInputElement = textInput.first();
      textInputElement.attr('aria-label', 'java editor panel');
    }
    this.editor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, java(), oneDarkTheme, oneDarkHighlightStyle]
      }),
      parent: this._codeMirror
    });
  }

  render() {
    return (
      <div style={this.props.style}>
        <PaneHeader hasFocus={true}>
          <PaneSection>Editor</PaneSection>
        </PaneHeader>
        <div ref={el => (this._codeMirror = el)} style={style.editor} />
      </div>
    );
  }
}

export default connect(
  state => ({
    editorText: state.javalab.editorText
  }),
  dispatch => ({
    setEditorText: editorText => dispatch(setEditorText(editorText))
  })
)(JavalabEditor);
