import React from 'react';
import AceEditor from 'react-ace';

export default class JavalabView extends React.Component {
  onChange = newValue => {
    console.log('change', newValue);
  };

  render() {
    return (
      <AceEditor
        mode="java"
        theme="github"
        onChange={this.onChange}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}
