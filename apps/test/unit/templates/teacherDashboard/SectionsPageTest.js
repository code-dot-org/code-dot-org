import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { UnconnectedSectionsPage as SectionsPage }
  from '@cdo/apps/templates/teacherDashboard/SectionsPage';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';

const defaultProps = {
  validScripts: [],
  numSections: 3,
  classrooms: null,
  studioUrl: '',
  newSection: () => {},
  setSections: () => {},
  setValidAssignments: () => {},
  loadClassroomList: () => {},
  importClassroomStarted: () => {},
  beginEditingNewSection: () => {},
  beginEditingSection: () => {},
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
    assert(requests.some(request => request.url === '/dashboardapi/sections/'));
  });

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

  it('provides default course id when creating new section', () => {
    const newSectionFunction = sinon.spy();
    const wrapper = shallow(
      <SectionsPage
        {...defaultProps}
        defaultCourseId={30}
        defaultScriptId={112}
        newSection={newSectionFunction}
      />, options
    );
    requests[0].respond(200, {}, '[]');
    requests[1].respond(200, {}, '[]');
    assert.equal(wrapper.state('sectionsLoaded'), true);

    const newSectionButton = wrapper.find('Button').first();
    newSectionButton.simulate('click');
    assert.deepEqual(newSectionFunction.firstCall.args, [30]);
  });

  describe('with sections flow experiment', () => {
    before(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    after(() => experiments.setEnabled(SECTION_FLOW_2017, true));

    it('provides default courseId and scriptId when creating new section', () => {
      const newSectionFunction = sinon.spy();
      const wrapper = shallow(
        <SectionsPage
          {...defaultProps}
          defaultCourseId={30}
          defaultScriptId={112}
          beginEditingNewSection={newSectionFunction}
        />, options
      );
      requests[0].respond(200, {}, '[]');
      requests[1].respond(200, {}, '[]');
      assert.equal(wrapper.state('sectionsLoaded'), true);

      const newSectionButton = wrapper.find('Button').first();
      newSectionButton.simulate('click');
      assert.deepEqual(newSectionFunction.firstCall.args, [30, 112]);
    });
  });
});
