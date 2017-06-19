import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import PrintCertificates from '@cdo/apps/templates/teacherDashboard/PrintCertificates';

const section = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: "my_section",
  loginType: "word",
  grade: "3",
  stageExtras: false,
  pairingAllowed: true,
  studentNames: ['joe', 'jane'],
  code: "PMTKVH",
  assignmentName: "playlab",
  assignmentPath: "//localhost-studio.code.org:3000/s/playlab"
};

describe('PrintCertificates', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  const wrapper = shallow(
    <PrintCertificates section={section} />
  );

  it('renders a form', () => {
    assert(wrapper.is('form'));
  });

  it('has a hidden input for the assigned script', () => {
    assert(wrapper.childAt(0).is('input'));
    assert.equal(wrapper.childAt(0).props().type, 'hidden');
    assert.equal(wrapper.childAt(0).props().value, 'playlab');
  });

  it('has hidden inputs for each student', () => {
    assert(wrapper.childAt(1).is('input'));
    assert.equal(wrapper.childAt(1).props().type, 'hidden');
    assert.equal(wrapper.childAt(1).props().value, 'joe');

    assert(wrapper.childAt(2).is('input'));
    assert.equal(wrapper.childAt(2).props().type, 'hidden');
    assert.equal(wrapper.childAt(2).props().value, 'jane');
  });

  it('has a submission button', () => {
    assert.equal(wrapper.find('ProgressButton').length, 1);
    assert.equal(wrapper.find('ProgressButton').props().text, 'Print Certificates');
  });
});
