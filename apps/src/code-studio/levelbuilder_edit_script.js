/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * TODO
 */
var TestComponent = React.createClass({
  propTypes: {
    // alignment: React.PropTypes.string,
    // assetChosen: React.PropTypes.func.isRequired
  },

  render() {
    return <div>Hello world</div>;
  }
});

ReactDOM.render(
  <TestComponent />,
  document.querySelector('.edit_container')
);
