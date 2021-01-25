import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-dracula';

export default class JavalabView extends React.Component {
  onChange = newValue => {
    console.log('change', newValue);
  };

  render() {
    return (
      <AceEditor
        mode="java"
        theme="dracula"
        onChange={this.onChange}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}
