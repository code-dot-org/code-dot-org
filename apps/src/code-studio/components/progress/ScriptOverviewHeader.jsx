import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';

/**
 * This component takes some of the HAML generated content on the script overview
 * page, and moves it under our React root. This is done so that we can have React
 * content above and below this.
 * Long term, instead of generating the DOM elements in haml, we should pass the
 * client the data and have React generate the DOM. Doing so should not be super
 * difficult in this case
 */
export default class ScriptOverviewHeader extends Component {
  componentDidMount() {
    $('#react-scriptoverview-header').appendTo(ReactDOM.findDOMNode(this.root));
  }

  render() {
    return (
      <ProtectedStatefulDiv
        ref={element => this.root = element}
      />
    );
  }
}
