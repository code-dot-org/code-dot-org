import React from 'react';
import SetupChecklist from "./SetupChecklist";
import SetupChecker from '../util/SetupChecker';

export default class SetupGuide extends React.Component {
  constructor(props) {
    super(props);
    this.setupChecker = new SetupChecker();
  }

  render() {
    return (
      <SetupChecklist setupChecker={this.setupChecker}/>
    );
  }
}
