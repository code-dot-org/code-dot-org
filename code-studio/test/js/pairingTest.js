var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('assert');
var Pairing = require('../../src/js/components/pairing.jsx')(require('react'));

describe('Pairing component for student in multiple sections', function(){
  var div;
  var component;

  var props = {
    sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]},
               {id: 15, name: "Anotther section"}],
    pairings: []
  };

  function render(props) {
    component = React.render(React.createElement(Pairing, props), div);
  }

  function numberOfStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length;
  }

  function sectionSelect() {
    return TestUtils.findRenderedDOMComponentWithTag(component, 'select');
  }

  beforeEach(function () {
    div = document.createElement("div");
    render(props);
  });

  afterEach(function () {
    if (div) {
      React.unmountComponentAtNode(div);
      component = null;
    }
  });

  it('should render a section dropdown', function() {
    render(props);

    assert(sectionSelect());
  });

  it('should not render a list of students', function() {
    render(props);

    assert.equal(0, numberOfStudents());
  });

  it('should change the section and render a list of students when a section with students is selected', function() {
    render(props);

    // choose first section
    TestUtils.Simulate.change(sectionSelect(), {target: {value: "1"}});
    assert.equal("1", sectionSelect().props.value);
    assert.equal(2, numberOfStudents());

    // choose second section
    TestUtils.Simulate.change(sectionSelect(), {target: {value: "15"}});
    assert.equal("15", sectionSelect().props.value);
    assert.equal(0, numberOfStudents());
  });
});

describe('Pairing component for student in one section', function(){
  var div;
  var component;

  var props = {
    sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
    pairings: []
  };

  function render(props) {
    component = React.render(React.createElement(Pairing, props), div);
  }

  function numberOfStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length;
  }

  function numberOfSelectedStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length;
  }

  function isSubmitButtonDisabled() {
    return TestUtils.scryRenderedDOMComponentsWithTag(component, 'button')[0].props.disabled;
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


  it('should not render a section dropdown', function() {
    render(props);

    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
  });


  it('should render a list of students', function() {
    render(props);

    assert.equal(2, numberOfStudents());
    assert.equal(0, numberOfSelectedStudents());
  });

  it('should select a student when clicking on it', function() {
    render(props);

    assert.equal(2, numberOfStudents());
    assert.equal(0, numberOfSelectedStudents());
    assert(isSubmitButtonDisabled());

    // click on first student to select
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
    assert.equal(2, numberOfStudents());
    assert.equal(1, numberOfSelectedStudents());
    assert(! isSubmitButtonDisabled());

    // click on second student to select
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);
    assert.equal(2, numberOfStudents());
    assert.equal(2, numberOfSelectedStudents());
    assert(! isSubmitButtonDisabled());

    // click on second student again to unselect
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);
    assert.equal(2, numberOfStudents());
    assert.equal(1, numberOfSelectedStudents());
    assert(! isSubmitButtonDisabled());

    // click on first student again to unselect
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
    assert.equal(2, numberOfStudents());
    assert.equal(0, numberOfSelectedStudents());
    assert(isSubmitButtonDisabled());

  });

  it('should let you select a student and add them as a partner', function() {
    render(props);

    assert.equal(2, numberOfStudents());
    assert.equal(0, numberOfSelectedStudents());
    assert(isSubmitButtonDisabled());

    // click on first student to select
    TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
    assert.equal(2, numberOfStudents());
    assert.equal(1, numberOfSelectedStudents());
    assert(! isSubmitButtonDisabled());

    // click on Add Partner to confirm
    TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(component, 'button'));

    // show only selected student
    assert.equal(1, numberOfStudents());
  });


});

describe('Pairing component for student who is currently pairing', function(){
  var div;
  var component;

  var props = {
    sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]},
               {id: 56, name: "Another section"}],
    pairings: [{id: 546, name: "Josh"}, {id: 563, name: "Charing"}, {id: 96747, name: "Andrew O."}]
  };

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

  function numberOfStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length;
  }

  it('should not render a section dropdown', function() {
    render(props);

    assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
  });


  it('should render a list of students', function() {
    render(props);

    assert.equal(3, numberOfStudents());
  });

  it('should remove all students and go back to selection mode when clicking Stop', function() {
    render(props);

    assert.equal(3, numberOfStudents());

    // click on stop button
    TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(component, 'stop'));

    assert.equal(0, numberOfStudents());
    assert(TestUtils.findRenderedDOMComponentWithTag(component, 'select'));
  });

});
