import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';
import sinon from 'sinon';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing.jsx';

describe('Pairing component', function () {
  var div;
  var component;
  var server;

  function render(ajaxUrl) {
    component = ReactDOM.render(React.createElement(Pairing, {source: ajaxUrl}), div);
  }

  function numberOfStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'student').length;
  }

  function numberOfSelectedStudents() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'selected').length;
  }

  function sectionSelect() {
    return TestUtils.findRenderedDOMComponentWithTag(component, 'select');
  }

  function addPartnersButtonRendered() {
    return TestUtils.scryRenderedDOMComponentsWithClass(component, 'addPartners').length;
  }

  function addPartnersButton() {
    return TestUtils.findRenderedDOMComponentWithClass(component, 'addPartners');
  }

  function setupFakeAjax(url, response) {
    server = sinon.fakeServer.create();

    server.respondWith("GET", url, [
      200, {"Content-Type": "application/json"}, JSON.stringify(response)
    ]);
  }

  function teardownFakeAjax() {
    server.restore();
  }

  describe('for student in multiple sections', function () {
    var ajaxUrl = '/pairings';
    var ajaxState = {
      sections: [{
        id: 1,
        name: "A section",
        students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]
      },
      {id: 15, name: "Another section"}],
      pairings: []
    };

    beforeEach(function () {
      div = document.createElement("div");

      setupFakeAjax(ajaxUrl, ajaxState);

      render(ajaxUrl);
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();

      if (div) {
        ReactDOM.unmountComponentAtNode(div);
        component = null;
      }
    });

    it('should render a section dropdown', function () {
      assert(sectionSelect());
    });

    it('should not render a list of students', function () {
      assert.equal(0, numberOfStudents());
    });

    it('should change the section and render a list of students when a section with students is selected', function () {
      // choose first section
      TestUtils.Simulate.change(sectionSelect(), {target: {value: "1"}});
      assert.equal("1", sectionSelect().value);
      assert.equal(2, numberOfStudents());

      // choose second section
      TestUtils.Simulate.change(sectionSelect(), {target: {value: "15"}});
      assert.equal("15", sectionSelect().value);
      assert.equal(0, numberOfStudents());
    });
  });

  describe('before ajax response is received', function () {
    beforeEach(function () {
      div = document.createElement("div");
      component = ReactDOM.render(React.createElement(Pairing, {}), div);
    });

    afterEach(function () {
      if (div) {
        ReactDOM.unmountComponentAtNode(div);
        component = null;
      }
    });

    it('should not render a section dropdown', function () {
      assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
    });
  });

  describe('for student in one section', function () {
    var ajaxUrl = '/pairings';
    var ajaxState = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };

    beforeEach(function () {
      div = document.createElement("div");

      setupFakeAjax(ajaxUrl, ajaxState);

      render(ajaxUrl);
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();

      if (div) {
        ReactDOM.unmountComponentAtNode(div);
        component = null;
      }
    });

    it('should not render a section dropdown', function () {
      assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
    });


    it('should render a list of students', function () {
      assert.equal(2, numberOfStudents());
      assert.equal(0, numberOfSelectedStudents());
    });

    it('should select a student when clicking on it', function () {
      assert.equal(2, numberOfStudents());
      assert.equal(0, numberOfSelectedStudents());
      assert(!addPartnersButtonRendered());

      // click on first student to select
      TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
      assert.equal(2, numberOfStudents());
      assert.equal(1, numberOfSelectedStudents());
      assert(addPartnersButtonRendered());

      // click on second student to select
      TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);
      assert.equal(2, numberOfStudents());
      assert.equal(2, numberOfSelectedStudents());
      assert(addPartnersButtonRendered());

      // click on second student again to unselect
      TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[1]);
      assert.equal(2, numberOfStudents());
      assert.equal(1, numberOfSelectedStudents());
      assert(addPartnersButtonRendered());

      // click on first student again to unselect
      TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
      assert.equal(2, numberOfStudents());
      assert.equal(0, numberOfSelectedStudents());
      assert(!addPartnersButtonRendered());
    });

    it('should let you select a student and add them as a partner', function () {
      assert.equal(2, numberOfStudents());
      assert.equal(0, numberOfSelectedStudents());
      assert(!addPartnersButtonRendered());

      // click on first student to select
      TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithClass(component, 'student')[0]);
      assert.equal(2, numberOfStudents());
      assert.equal(1, numberOfSelectedStudents());
      assert(addPartnersButtonRendered());

      // click on Add Partner to confirm
      TestUtils.Simulate.click(addPartnersButton());

      // verify that the right data is sent to the server
      let data = server.requests[server.requests.length - 1].requestBody;
      assert.equal('{"pairings":[{"id":11,"name":"First student"}]}', data);
    });
  });

  describe('for student who is currently pairing', function () {
    var ajaxUrl = '/pairings';
    var ajaxState = {
      sections: [{
        id: 1,
        name: "A section",
        students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]
      }, {
        id: 56,
        name: "Another section"
      }],
      pairings: [{id: 546, name: "Josh"}, {id: 563, name: "Charing"}, {id: 96747, name: "Andrew O."}]
    };

    beforeEach(function () {
      div = document.createElement("div");

      setupFakeAjax(ajaxUrl, ajaxState);

      render(ajaxUrl);
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();

      if (div) {
        ReactDOM.unmountComponentAtNode(div);
        component = null;
      }
    });

    it('should not render a section dropdown', function () {
      assert.equal(0, TestUtils.scryRenderedDOMComponentsWithTag(component, 'select').length);
    });

    it('should render a list of students', function () {
      assert.equal(3, numberOfStudents());
    });

    it('should remove all students and go back to selection mode when clicking Stop', function () {
      assert.equal(3, numberOfStudents());

      // click on stop button
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(component, 'stop'));

      assert.equal(0, numberOfStudents());
      assert(TestUtils.findRenderedDOMComponentWithTag(component, 'select'));
    });
  });
});
