import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';

export default class JavaIdeView extends React.Component {
  onChange = newValue => {
    console.log('change', newValue);
  };

  render() {
    return (
      <AceEditor
        mode="java"
        theme="monokai"
        onChange={this.onChange}
        name="java_ide_editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}
