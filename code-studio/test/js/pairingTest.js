var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('assert');
var Pairing = require('../../src/js/components/pairing.jsx')(require('react'));

describe('Pairing component', function(){
  var div;
  var component;

  function render(props) {
    component = React.render(React.createElement(Pairing, props), div);
  }

  beforeEach(function () {
    div = document.createElement("div");
  });

  afterEach(function () {
    if (div) {
      React.unmountComponentAtNode(div);
      component = null;
    }
  });

  it('should render a dropdown if the student is in multiple sections', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]},
                 {id: 15, name: "Anotther section"}],
      pairings: [{id: 123, name: 'a student'}]
    };
    render(props);
    assert(div);
    TestUtils.findRenderedDOMComponentWithTag(component, 'select');
  });


  it('should not render a dropdown if the student is not in multiple sections', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };
    render(props);
    assert(div);
    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
  });

});
