import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import experiments from '@cdo/apps/util/experiments';
import { UnconnectedSectionsPage as SectionsPage }
  from '@cdo/apps/templates/teacherDashboard/SectionsPage';

const defaultProps = {
  validScripts: [
  ],
  numSections: 3,
  classrooms: null,
  newSection: () => {},
  setSections: () => {},
  setValidAssignments: () => {},
  loadClassroomList: () => {},
};

describe('SectionsPage', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  let xhr;
  let requests = [];

  // Intercept all XHR requests, storing the last one
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = req => {
      requests.push(req);
    };
  });

  afterEach(() => {
    requests = [];
    xhr.restore();
  });

  const options = {
    lifecycleExperimental: true
  };

  it('queries sections on load', () => {
    shallow(
      <SectionsPage
        {...defaultProps}
      />, options
    );
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, '/v2/sections/');
  });

  describe('with sectionFocus experiment not enabled', () => {
    it('sets sectionsLoaded after section query', () => {
      const wrapper = shallow(
        <SectionsPage
          {...defaultProps}
        />, options
      );
      assert.equal(wrapper.state('sectionsLoaded'), false);
      requests[0].respond(200, {}, '[]');
      assert.equal(wrapper.state('sectionsLoaded'), true);
    });

    it('does not call setValidAssignments upon load', () => {
      const setValidAssignments = sinon.spy();
      shallow(
        <SectionsPage
          {...defaultProps}
          setValidAssignments={setValidAssignments}
        />, options
      );
      requests[0].respond(200, {}, '[]');
      assert(setValidAssignments.notCalled);
    });

    it('does call setSections upon load', () => {
      const setSections = sinon.spy();
      shallow(
        <SectionsPage
          {...defaultProps}
          setSections={setSections}
        />, options
      );
      requests[0].respond(200, {}, '[]');
      assert(setSections.called);
    });
  });

  describe('with sectionFocus experiment', () => {
    before(() => experiments.setEnabled('sectionFocus', true));
    after(() => experiments.setEnabled('sectionFocus', false));

    it('queries for courses', () => {
      shallow(
        <SectionsPage
          {...defaultProps}
        />, options
      );

      assert.equal(requests.length, 2);
      assert.equal(requests[0].url, '/dashboardapi/courses');
    });

    it('sets sectionsLoaded only after sections and courses are loaded', () => {
      const wrapper = shallow(
        <SectionsPage
          {...defaultProps}
        />, options
      );
      assert.equal(wrapper.state('sectionsLoaded'), false);
      requests[0].respond(200, {}, '[]');
      assert.equal(wrapper.state('sectionsLoaded'), false);
      requests[1].respond(200, {}, '[]');
      assert.equal(wrapper.state('sectionsLoaded'), true);
    });

    it('calls setValidAssignments after sections and courses are loaded', () => {
      const setValidAssignments = sinon.spy();
      shallow(
        <SectionsPage
          {...defaultProps}
          setValidAssignments={setValidAssignments}
        />, options
      );

      // respond to courses
      requests[0].respond(200, {}, '[]');
      assert(setValidAssignments.notCalled);

      // respond to sections
      requests[1].respond(200, {}, '[]');
      assert(setValidAssignments.called);
    });
  });
});
