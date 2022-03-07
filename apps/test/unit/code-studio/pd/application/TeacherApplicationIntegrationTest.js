import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {PageLabels} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';
import firehoseClient from '@cdo/apps/lib/util/firehose';

describe('TeacherApplication', () => {
  const fakeOptionKeys = Object.values(PageLabels).reduce(
    (acc, cur) => acc.concat(Object.keys(cur)),
    []
  );
  const fakeOptions = fakeOptionKeys.reduce(
    (acc, cur) => ({...acc, [cur]: ['1', '2', '3']}),
    {}
  );
  const defaultProps = {
    apiEndpoint: '/path/to/endpoint',
    options: fakeOptions,
    accountEmail: 'user@email.com',
    userId: 1
  };

  let googleAnalyticsStub;
  let firehoseClientStub;

  beforeEach(() => {
    sinon
      .stub(window.sessionStorage, 'getItem')
      .withArgs('TeacherApplication')
      .returns(JSON.stringify({}));
    sinon.stub(window.sessionStorage, 'setItem');
    googleAnalyticsStub = sinon.fake();
    window.ga = googleAnalyticsStub;
    firehoseClientStub = sinon.stub(firehoseClient, 'putRecord');
  });

  afterEach(() => {
    window.sessionStorage.getItem.restore();
    window.sessionStorage.setItem.restore();
    window.ga = undefined;
    firehoseClientStub.restore();
  });

  it('Sends firehose event on initialization and save', () => {
    // Also calls firehose event on submit, but we reload the page on submit
    // The page reload can't be stubbed because `window.location.reload`
    // is not writable nor configurable: Object.getOwnPropertyDescriptor(window.location, 'toString')
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#modifying_a_property
    const teacherApp = mount(
      <TeacherApplication {...defaultProps} allowPartialSaving />
    );
    const formControllerProps = teacherApp.find('FormController').props();
    sinon.assert.calledOnce(firehoseClientStub);

    formControllerProps.onSuccessfulSave();
    sinon.assert.calledTwice(firehoseClientStub);
  });
  it('Does not set schoolId if not provided', () => {
    const page = mount(<TeacherApplication {...defaultProps} />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      undefined
    );
  });
  it('Sets the school dropdown value from props', () => {
    const page = mount(<TeacherApplication {...defaultProps} schoolId="50" />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '50'
    );
  });
  it('Sets the school dropdown value from storage', () => {
    window.sessionStorage.getItem.restore();
    sinon
      .stub(window.sessionStorage, 'getItem')
      .withArgs('TeacherApplication')
      .returns(JSON.stringify({data: {school: '25'}}));
    const page = mount(<TeacherApplication {...defaultProps} />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '25'
    );
  });
  it('Reports to google analytics', () => {
    mount(<TeacherApplication {...defaultProps} />);
    sinon.assert.called(window.ga);
  });
});
