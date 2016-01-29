// // file: test/setup.js
// var jsdom = require('jsdom');

// // A super simple DOM ready for React to render into
// // Store this DOM and the window in global scope ready for React to access
// global.document = jsdom.jsdom('<!doctype html><html><body><div id="content"></div></body></html>');
// global.window = document.parentWindow;
// global.navigator = window.navigator;


var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('assert');
var Pairing = require('../../src/js/components/pairing.jsx')(require('react'));

describe('Pairing component', function(){
  var div;
  var comp;

  function render(props) {
    comp = React.render(React.createElement(Pairing, props), div);
  }

  beforeEach(function () {
    div = document.createElement("div");
  });

  afterEach(function () {
    if (div) {
      React.unmountComponentAtNode(div);
      comp = null;
    }
  });

  it('should render', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]},
                 {id: 15, name: "Anotther section"}],
      pairings: [{id: 123, name: 'a student'}]
    };
    render(props);
    assert(div);
  });
});
