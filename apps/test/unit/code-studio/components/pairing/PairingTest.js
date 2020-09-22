import React from 'react';
import sinon from 'sinon';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing.jsx';

describe('Pairing component', function() {
  function createDomElement() {
    return mount(<Pairing source="/pairings" />);
  }

  function setupFakeAjax(response, httpCode = 200) {
    var server = sinon.fakeServer.create();
    server.respondWith('GET', '/pairings', [
      httpCode,
      {'Content-Type': 'application/json'},
      JSON.stringify(response)
    ]);
    return server;
  }

  function teardownFakeAjax(server) {
    server.restore();
  }

  function verifyStartingValues(component, student = 0, select = 0, stop = 0) {
    expect(component.find('Pairing').length).to.equal(1);
    expect(component.find('.selected').length).to.equal(0);
    expect(component.find('.addPartners').length).to.equal(0);
    expect(component.find('.student').length).to.equal(student);
    expect(component.find('select').length).to.equal(select);
    expect(component.find('.stop').length).to.equal(stop);
  }

  describe('handles http errors', () => {
    let server, component;
    afterEach(function() {
      teardownFakeAjax(server);
      component = null;
    });

    it('when the GET request fails', () => {
      server = setupFakeAjax('', 500);
      component = createDomElement();
      expect(component.state().loading).to.be.true;
      server.respond();
      component.update();

      expect(component.state().hasError).to.be.true;
      expect(component.state().loading).to.be.false;
    });
  });

  describe('handles failed PUT requests', () => {
    let server, component;
    let ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [{id: 11, name: 'First student'}]
        }
      ],
      pairings: []
    };

    beforeEach(() => {
      server = setupFakeAjax(ajaxState);
      server.respondWith('PUT', '/pairings', [
        500,
        {'Content-Type': 'application/json'},
        ''
      ]);
      component = createDomElement();
      server.respond();
      component.update();
    });

    afterEach(() => {
      teardownFakeAjax(server);
      component = null;
    });

    it('in handleAddPartners', () => {
      expect(component.state().hasError).to.be.false;
      expect(component.state().loading).to.be.false;

      component.instance().handleAddPartners([11]);
      component.update();
      expect(component.state().loading).to.be.true;
      expect(component.state().hasError).to.be.false;
      server.respond();
      component.update();

      expect(component.state().hasError).to.be.true;
      expect(component.state().loading).to.be.false;
    });

    it('in handleStop', () => {
      expect(component.state().hasError).to.be.false;

      component.instance().handleStop({preventDefault: () => {}});
      component.update();
      expect(component.state().loading).to.be.true;
      expect(component.state().hasError).to.be.false;
      server.respond();
      component.update();

      expect(component.state().hasError).to.be.true;
      expect(component.state().loading).to.be.false;
    });
  });

  describe('for student in multiple sections', function() {
    var component;
    var server;
    var ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'}
          ]
        },
        {id: 15, name: 'Another section'}
      ],
      pairings: []
    };

    beforeEach(function() {
      server = setupFakeAjax(ajaxState);
      component = createDomElement();
      server.respond();
      component.update();
    });

    afterEach(function() {
      teardownFakeAjax(server);
      component = null;
    });

    it('should change the section and render a list of students when a section with students is selected', function() {
      verifyStartingValues(component, 0, 1);

      // choose first section
      component.find('select').prop('onChange')({target: {value: '1'}});
      component.update();
      expect(component.find('select').props().value).to.equal(1);
      expect(component.find('.student').length).to.equal(2);

      // choose second section
      component.find('select').prop('onChange')({target: {value: '15'}});
      component.update();
      expect(component.find('select').props().value).to.equal(15);
      expect(component.find('.student').length).to.equal(0);
    });
  });

  describe('before ajax response is received', function() {
    var component;
    beforeEach(function() {
      component = mount(React.createElement(Pairing, {}));
      component.update();
    });

    afterEach(function() {
      component = null;
    });

    it('should not render a section dropdown', function() {
      verifyStartingValues(component);
    });
  });

  describe('for student in one section', function() {
    var component;
    var server;
    var ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'}
          ]
        }
      ],
      pairings: []
    };

    beforeEach(function() {
      server = setupFakeAjax(ajaxState);
      component = createDomElement();
      server.respond();
      component.update();
    });

    afterEach(function() {
      teardownFakeAjax(server);
      component = null;
    });

    it('should recall two students are selected when two students are clicked', function() {
      verifyStartingValues(component, 2);

      // click on both students to select
      component
        .find('.student')
        .first()
        .simulate('click');
      component
        .find('.student')
        .last()
        .simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(2);
      expect(component.find('.addPartners').length).to.equal(1);
    });

    it('should stop displaying addPartners when student is unclicked', function() {
      verifyStartingValues(component, 2);

      // click on first student to select
      component
        .find('.student')
        .first()
        .simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(1);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on first student again to unselect
      component
        .find('.student')
        .first()
        .simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(0);
      expect(component.find('.addPartners').length).to.equal(0);
    });

    it('should let you select a student and add them as a partner', function() {
      verifyStartingValues(component, 2);

      // click on first student to select
      component
        .find('.student')
        .first()
        .simulate('click');
      expect(component.find('.student').length).to.equal(2);
      expect(component.find('.selected').length).to.equal(1);
      expect(component.find('.addPartners').length).to.equal(1);

      // click on Add Partner to confirm
      component
        .find('.addPartners')
        .first()
        .simulate('click');

      // verify that the right data is sent to the server
      let data = server.requests[server.requests.length - 1].requestBody;
      expect(
        '{"pairings":[{"id":11,"name":"First student"}],"sectionId":1}'
      ).to.equal(data);
    });
  });

  describe('for student who is currently pairing', function() {
    var component;
    var server;
    var ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'}
          ]
        },
        {
          id: 56,
          name: 'Another section'
        }
      ],
      pairings: [
        {id: 546, name: 'Josh'},
        {id: 563, name: 'Charing'},
        {id: 96747, name: 'Andrew O.'}
      ]
    };

    beforeEach(function() {
      server = setupFakeAjax(ajaxState);
      server.respondWith('PUT', '/pairings', [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({sections: [], pairings: []})
      ]);
      component = createDomElement();
      server.respond();
      component.update();
    });

    afterEach(function() {
      teardownFakeAjax(server);
      component = null;
    });

    it('should remove all students and go back to selection mode when clicking Stop', function() {
      verifyStartingValues(component, 3, 0, 1);

      // click on stop button
      component.find('.stop').simulate('click');
      server.respond();
      component.update();
      expect(component.find('.student').length).to.equal(0);
      expect(component.find('select').length).to.equal(1);
    });
  });
});
