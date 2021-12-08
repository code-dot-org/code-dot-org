import React from 'react';
import {expect} from 'chai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {isolateComponent} from 'isolate-components';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {PageLabels} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';

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
    window.sessionStorage.setItem(
      'TeacherApplication',
      JSON.stringify({data: {school: '25'}})
    );
    const page = mount(<TeacherApplication {...defaultProps} />);
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '25'
    );
  });
  it('Logs user id on initialization', () => {
    const fc = sinon.stub(firehoseClient, 'putRecord');
    shallow(<TeacherApplication {...defaultProps} />);
    expect(fc.calledWith(sinon.match({userId: 1})));
  });
  it('Reports to google analytics', () => {
    const form = mount(<TeacherApplication {...defaultProps} />);
    const nextButton = form.find('#next').first();
    nextButton.simulate('click');
    expect(ga.getCall(2).calledWith());
  });
  describe('getInitialData', () => {
    const savedFormData =
      '{' +
      '"firstName": "Brilliant", ' +
      '"lastName": "Teacher", ' +
      '"previousPd": ["CS Principles","CS Discoveries"]' +
      '}';
    const parsedData = JSON.parse(savedFormData);
    const schoolId = '5';
    const wrapper = isolateComponent(
      <TeacherApplication {...defaultProps} allowPartialSaving />
    );

    it('has no initial data if there is nothing in session storage, no school id, and no form data', () => {
      expect(
        wrapper.findOne('FormController').props.getInitialData()
      ).to.deep.equal({});
    });
    it('has saved form data if nothing in session storage and no school id', () => {
      wrapper.mergeProps({savedFormData});
      expect(
        wrapper.findOne('FormController').props.getInitialData()
      ).to.deep.equal(parsedData);
    });
    it('has saved form data and school id if nothing in session storage', () => {
      wrapper.mergeProps({savedFormData, schoolId});
      expect(
        wrapper.findOne('FormController').props.getInitialData()
      ).to.deep.equal({
        ...parsedData,
        school: schoolId
      });
    });
    it('has only saved form data and no school id if session storage has school info', () => {
      window.sessionStorage.setItem(
        'TeacherApplication',
        JSON.stringify({data: {school: '25'}})
      );
      wrapper.mergeProps({savedFormData, schoolId});
      expect(
        wrapper.findOne('FormController').props.getInitialData()
      ).to.deep.equal(parsedData);
    });
    it('does not include saved form data if partial saving is not allowed', () => {
      wrapper.mergeProps({savedFormData, schoolId, allowPartialSaving: false});
      expect(
        wrapper.findOne('FormController').props.getInitialData()
      ).to.deep.equal({
        school: schoolId
      });
    });
  });
});
