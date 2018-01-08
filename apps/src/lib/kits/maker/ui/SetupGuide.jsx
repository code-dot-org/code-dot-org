import React from 'react';
import SetupChecklist from "./SetupChecklist";
import SetupChecker from '../util/SetupChecker';
import {isCodeOrgBrowser, isChromeOS, isOSX, isWindows} from '../util/browserChecks';

export default class SetupGuide extends React.Component {
  constructor(props) {
    super(props);
    this.setupChecker = new SetupChecker();
  }

  render() {
    if (isCodeOrgBrowser() || isChromeOS()) {
      return <SetupChecklist setupChecker={this.setupChecker}/>;
    } else if (isOSX() || isWindows()) {
      // TODO: Download view
      // Link to download/install Maker Browser, and link to support resources.
      return <div/>;
    }
    // TODO: Unsupported browser view
    // List of supported platforms and link to support resources.
    return <div/>;
  }
}
