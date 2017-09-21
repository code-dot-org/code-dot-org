import {assert} from '../../../util/configuredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const sectionId = 11;

describe('PrintCertificates', () => {
  const wrapper = shallow(
    <PrintCertificates
      sectionId={sectionId}
      assignmentName="playlab"
      curriedPegasusUrl={path => `${path}`}
    />
  );

  it('renders a form', () => {
    assert(wrapper.is('form'));
    assert(wrapper.props().action, pegasus('/certificates'));
  });

  it('has a hidden input for the assigned script', () => {
    assert(wrapper.childAt(0).is('input'));
    assert.equal(wrapper.childAt(0).props().type, 'hidden');
    assert.equal(wrapper.childAt(0).props().defaultValue, 'playlab');
  });

  it('has a submission button', () => {
    assert.equal(wrapper.find('Button').length, 1);
    assert.equal(wrapper.find('Button').props().text, 'Print certificates');
  });

  it('loads student names', finish => {
    const xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = request => {
      setTimeout(() => {
        const mockResponse = JSON.stringify([
          {name: "Student A"},
          {name: "Student B"},
          {name: "Student C"},
        ]);
        request.respond(200, {'Content-Type': 'application/json'}, mockResponse);
      }, 0);
    };

    wrapper.instance().submitForm = () => {
      assert.deepEqual(wrapper.state('names'), ['Student A', 'Student B', 'Student C']);
      finish();
    };

    assert.deepEqual(wrapper.state('names'), []);
    wrapper.find('Button').simulate('click');
  });
});
