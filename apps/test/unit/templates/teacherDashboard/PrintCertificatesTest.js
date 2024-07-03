import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';

const sectionId = 11;

describe('PrintCertificates', () => {
  const wrapper = shallow(
    <PrintCertificates
      sectionId={sectionId}
      courseVersionName="playlab"
      curriedPegasusUrl={path => `${path}`}
    />
  );

  it('renders a form', () => {
    expect(wrapper.is('form')).toBeTruthy();
    expect(wrapper.props().action).toBeTruthy();
  });

  it('has a hidden input for the course name', () => {
    expect(wrapper.childAt(1).is('input')).toBeTruthy();
    expect(wrapper.childAt(1).props().type).toEqual('hidden');
    expect(atob(wrapper.childAt(1).props().value)).toEqual('playlab');
  });

  it('has trigger to open /certificates', () => {
    expect(wrapper.find('div').length).toEqual(2);
    expect(
      wrapper.find('div').last().contains('Print Certificates')
    ).toBeTruthy();
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
      expect(wrapper.state('names')).toEqual([
        'Student A',
        'Student B',
        'Student C',
      ]);
      finish();
    };

    expect(wrapper.state('names')).toEqual([]);
    wrapper.find('div').last().simulate('click');
    sinon.restore();
  });
});
