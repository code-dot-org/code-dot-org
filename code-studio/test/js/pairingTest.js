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
      pairings: []
    };

    render(props);

    TestUtils.findRenderedDOMComponentWithTag(component, 'select');
  });


  it('should not render a dropdown if the student is not in multiple sections', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };

    render(props);

    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
  });


  it('should render a list of students to pick from if the student is in one section with students', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };

    render(props);

    // 2 students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length);
    // no selected students
    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length);
  });

  it('should selected a student when clicking on it', function() {
    var props = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };

    render(props);

    // 2 students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length);
    // no selected students
    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length);

    // click on first student to select
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);

    // 2 students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length);
    // 1 selected student
    assert.equal(1, TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length);

    // click on second student to select
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);

    // 2 students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length);
    // 2 selected students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length);

    // click on first student again to unselect
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);

    // 2 students
    assert.equal(2, TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length);
    // 1 selected student
    assert.equal(1, TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length);
  });

});
