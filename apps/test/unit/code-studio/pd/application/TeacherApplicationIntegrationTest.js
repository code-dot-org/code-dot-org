import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {PageLabels} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';
import * as utils from '@cdo/apps/utils';
import $ from 'jquery';
import FindYourRegion from '../../../../../src/code-studio/pd/application/teacher/FindYourRegion';

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
    errors: [],
    data: {},
    onChange: () => {},
  };

  beforeEach(() => {
    sinon.stub($, 'ajax').returns(new $.Deferred());
    sinon.stub($, 'param').returns(new $.Deferred());
    sinon.stub(window, 'fetch').returns(Promise.resolve({ok: true}));
    sinon.stub(utils, 'reload');
    sinon
      .stub(window.sessionStorage, 'getItem')
      .withArgs('TeacherApplication')
      .returns(JSON.stringify({}));
    sinon.stub(window.sessionStorage, 'setItem');
    window.ga = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
    window.ga = undefined;
  });

  it('Does not set schoolId if not provided', () => {
    const page = mount(
      <FindYourRegion {...defaultProps} data={{program: 'CSD'}} />
    );
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      undefined
    );
  });

  it('Sets the school dropdown value from props', () => {
    const page = mount(
      <FindYourRegion {...defaultProps} data={{program: 'CSD', school: '50'}} />
    );
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '50'
    );
  });

  it('Sets the school dropdown value from storage', () => {
    window.sessionStorage.getItem.restore();
    sinon
      .stub(window.sessionStorage, 'getItem')
      .withArgs('TeacherApplication')
      .returns({program: 'CSD', school: '25'});
    const page = mount(
      <FindYourRegion
        {...defaultProps}
        data={window.sessionStorage.getItem('TeacherApplication')}
      />
    );
    expect(page.find('SchoolAutocompleteDropdown').prop('value')).to.equal(
      '25'
    );
  });

  it('Reports to google analytics', () => {
    mount(<TeacherApplication {...defaultProps} />);
    sinon.assert.called(window.ga);
  });
});
