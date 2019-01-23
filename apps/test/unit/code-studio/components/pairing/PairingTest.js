import React from 'react';
import assert from 'assert';
import sinon from 'sinon';
import {mount} from 'enzyme';
import {expect} from '../../../../util/configuredChai';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing.jsx';

describe('Pairing component', function () {
  var component;
  var server;

  function createDomElement(ajaxUrl) {
    component = mount(React.createElement(Pairing, {source: ajaxUrl}));
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
      setupFakeAjax(ajaxUrl, ajaxState);
      createDomElement(ajaxUrl);
      component.update();
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();
      component = null;
    });

    it('should render a section dropdown', function () {
      expect(component.find('select').length).to.equal(1);
    });

    it('should not render a list of students', function () {
      expect(component.find('.student').length).to.equal(0);
    });

    it('should change the section and render a list of students when a section with students is selected', function () {
      // choose first section
      component.find('select').simulate('change', {target: {value: '1'}});
      expect(component.find('select').props().value).to.equal(1);
      expect(component.find('.student').length).to.equal(2);

      // choose second section
      component.find('select').simulate('change', {target: {value: '15'}});
      expect(component.find('select').props().value).to.equal(15);
      expect(component.find('.student').length).to.equal(0);
    });
  });

  describe('before ajax response is received', function () {
    beforeEach(function () {
      component = mount(React.createElement(Pairing, {}));
      component.update();
    });

    afterEach(function () {
      component = null;
    });

    it('should not render a section dropdown', function () {
      expect(component.find('.stop').length).to.equal(0);
      expect(component.find('select').length).to.equal(0);
    });
  });

  describe('for student in one section', function () {
    var ajaxUrl = '/pairings';
    var ajaxState = {
      sections: [{id: 1, name: "A section", students: [{id: 11, name: "First student"}, {id: 12, name: "Second Student"}]}],
      pairings: []
    };

    beforeEach(function () {
      setupFakeAjax(ajaxUrl, ajaxState);
      createDomElement(ajaxUrl);
      component.update();
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();
      component = null;
    });

    it('should not render a section dropdown', function () {
      expect(component.find('select').length).to.equal(0);
    });

    it('should render a list of students', function () {
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(0);
    });

    it('should select a student when clicking on it', function () {
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(0);
      expect(component.find('.addPartners').length).to.equal(0);

      // click on first student to select
      component.find('.student').first().simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(1);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on second student to select
      component.find('.student').last().simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(2);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on second student again to unselect
      component.find('.student').last().simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(1);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on first student again to unselect
      component.find('.student').first().simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(0);
      expect(component.find('.addPartners').length).to.equal(0);
    });

    it('should let you select a student and add them as a partner', function () {
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(0);
      expect(component.find('.addPartners').length).to.equal(0);

      // click on first student to select
      component.find('.student').first().simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(1);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on Add Partner to confirm
      component.find('.addPartners').first().simulate('click');

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
      setupFakeAjax(ajaxUrl, ajaxState);
      createDomElement(ajaxUrl);
      component.update();
      server.respond();
    });

    afterEach(function () {
      teardownFakeAjax();
      component = null;
    });

    it('should not render a section dropdown', function () {
      expect(component.find('select').length).to.equal(0);
      expect(component.find('Pairing').length).to.equal(1);
    });

    it('should render a list of students', function () {
      expect(component.find('.student').length).to.equal(3);
    });

    it('should remove all students and go back to selection mode when clicking Stop', function () {
      expect(component.find('.student').length).to.equal(3);

      // click on stop button
      component.find('.stop').simulate('click');
      expect(component.find('.student').length).to.equal(0);
      expect(component.find('select').length).to.equal(1);
    });
  });
});
