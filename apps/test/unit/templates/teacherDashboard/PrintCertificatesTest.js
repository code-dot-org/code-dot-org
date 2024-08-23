import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {marketing} from '@cdo/apps/lib/util/urlHelpers';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';

import {assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const sectionId = 11;

describe('PrintCertificates', () => {
  const wrapper = shallow(
    <PrintCertificates
      sectionId={sectionId}
      courseVersionName="playlab"
      curriedMarketingUrl={path => `${path}`}
    />
  );

  it('renders a form', () => {
    assert(wrapper.is('form'));
    assert(wrapper.props().action, marketing('/certificates'));
  });

  it('has a hidden input for the course name', () => {
    assert(wrapper.childAt(1).is('input'));
    assert.equal(wrapper.childAt(1).props().type, 'hidden');
    assert.equal(atob(wrapper.childAt(1).props().value), 'playlab');
  });

  it('has trigger to open /certificates', () => {
    assert.equal(wrapper.find('div').length, 2);
    assert(wrapper.find('div').last().contains('Print Certificates'));
  });

  it('loads student names', finish => {
    const xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = request => {
      setTimeout(() => {
        const mockResponse = JSON.stringify([
          {name: 'Student A'},
          {name: 'Student B'},
          {name: 'Student C'},
        ]);
        request.respond(
          200,
          {'Content-Type': 'application/json'},
          mockResponse
        );
      }, 0);
    };

    wrapper.instance().submitForm = () => {
      assert.deepEqual(wrapper.state('names'), [
        'Student A',
        'Student B',
        'Student C',
      ]);
      finish();
    };

    assert.deepEqual(wrapper.state('names'), []);
    wrapper.find('div').last().simulate('click');
    sinon.restore();
  });
});
