import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {PageLabels} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';

describe('Teacher Application Component', () => {
  const fakeOptionKeys = Object.values(PageLabels).reduce(
    (acc, cur) => acc.concat(Object.keys(cur)),
    []
  );
  const fakeOptions = fakeOptionKeys.reduce(
    (acc, cur) => ({...acc, [cur]: ['1', '2', '3']}),
    {}
  );
  const defaultProps = {
    apiEndpoint: 'fgsfds',
    requiredFields: [],
    options: fakeOptions,
    accountEmail: 'user@email.com',
    userId: 1
  };

  let ga;

  beforeEach(() => {
    ga = sinon.fake();
    window.ga = ga;
    window.sessionStorage.removeItem('TeacherApplication');
  });

  afterEach(() => {
    window.ga = undefined;
    sinon.restore();
    window.sessionStorage.removeItem('TeacherApplication');
  });

  it('Doesnt set schoolId if not provided', () => {
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
    window.sessionStorage.setItem(
      'TeacherApplication',
      JSON.stringify({data: {school: '50'}})
    );
    const page = mount(<TeacherApplication {...defaultProps} />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '50'
    );
  });
  it('Logs user id on initialization', () => {
    const fc = sinon.stub(firehoseClient, 'putRecord');
    mount(<TeacherApplication {...defaultProps} />);
    expect(fc.calledWith(sinon.match({userId: 1})));
  });
  it('Reports to google analytics', () => {
    const form = mount(<TeacherApplication {...defaultProps} />);
    const nextButton = form.find('#next').first();
    nextButton.simulate('click');
    expect(ga.getCall(2).calledWith());
  });
});
