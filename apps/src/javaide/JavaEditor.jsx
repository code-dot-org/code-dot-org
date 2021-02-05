import React from 'react';
import AceEditor from 'react-ace';
import {connect} from 'react-redux';
import {setEditorText} from './redux';
import PropTypes from 'prop-types';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';

const style = {
  editor: {
    width: '100%',
    minHeight: '600px',
    height: '60%'
  }
};

class JavaEditor extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    // populated by redux
    editorText: PropTypes.string,
    setEditorText: PropTypes.func
  };

  onChange = newValue => {
    this.props.setEditorText(newValue);
  };

  render() {
    return (
      <div>
        <PaneHeader hasFocus={true}>
          <PaneSection>Editor</PaneSection>
        </PaneHeader>
        <AceEditor
          mode="java"
          theme="monokai"
          onChange={this.onChange}
          name="java-lab-editor"
          editorProps={{$blockScrolling: true}}
          style={style.editor}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    editorText: state.javaIde.editorText
  }),
  dispatch => ({
    setEditorText: editorText => dispatch(setEditorText(editorText))
  })
)(JavaEditor);
