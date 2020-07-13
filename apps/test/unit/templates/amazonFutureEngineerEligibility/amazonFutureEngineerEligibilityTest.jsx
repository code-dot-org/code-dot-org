import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibility';
import AmazonFutureEngineerEligibilityForm from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibilityForm';
import AmazonFutureEngineerAccountConfirmation from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerAccountConfirmation';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';

// Note: this is an incomplete set of tests for the flow that checks
// teacher eligibility for benefits from the Amazon Future Engineer program.
// We've done substantial manual testing here, and are not even sure if this
// will be reused in coming years, so we are releasing it without automated
// testing that fully covers the feature.
// Here are some aspects of that flow that are not fully tested:
// - the ability of the child AmazonFutureEngineerEligibilityForm component
//   to pass form data to the parent AmazonFutureEngineerEligibility component
//   when a user submits their information.
// - ability for a user to proceed to a sign in page, return signed in,
//   and effectively submit their information.
// - appropriate API calls to submit information to AFE.

describe('AmazonFutureEngineerEligibility', () => {
  const defaultProps = {
    signedIn: false,
    schoolId: null,
    schoolEligible: null,
    accountEmail: null,
    isStudentAccount: false
  };

  let server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
    window.sessionStorage.removeItem('AmazonFutureEngineerEligibility');
  });

  afterEach(function() {
    server.restore();
  });

  after(function() {
    window.sessionStorage.removeItem('AmazonFutureEngineerEligibility');
  });

  it('renders email and school inputs when we have no information about the user', () => {
    const wrapper = shallow(
      <AmazonFutureEngineerEligibility {...defaultProps} />
    );

    expect(wrapper.exists('#email'));
    expect(wrapper.exists(SchoolAutocompleteDropdownWithLabel));
  });

  it('renders form when teacher is signed in and eligible', () => {
    const signedInEligibleTeacherProps = {
      ...defaultProps,
      signedIn: true,
      schoolId: '123456789012',
      schoolEligible: true
    };

    const wrapper = shallow(
      <AmazonFutureEngineerEligibility {...signedInEligibleTeacherProps} />
    );

    expect(wrapper.exists(AmazonFutureEngineerEligibilityForm));
  });

  it('renders form once teacher has provided email and eligible school', () => {
    const userFormData = {
      email: 'test@test.com',
      schoolId: '123456789012',
      schoolName: 'Bryant ES - Seattle, WA 98105'
    };

    server.respondWith(
      'GET',
      '/dashboardapi/v1/schools/' + userFormData.schoolId + '/afe_high_needs',
      '{"afe_high_needs": true}'
    );

    const wrapper = shallow(
      <AmazonFutureEngineerEligibility {...defaultProps} />
    );

    wrapper.setState({
      formData: {...wrapper.state().formData, ...userFormData}
    });
    wrapper.find('#submit').simulate('click');
    server.respond();

    let sessionStorageFormData = sessionStorage.getItem(
      'AmazonFutureEngineerEligibility'
    );

    expect(sessionStorageFormData).to.equal(
      JSON.stringify(wrapper.state().formData)
    );
    expect(JSON.parse(sessionStorageFormData)).to.include.keys(
      'schoolEligible',
      'schoolId',
      'email'
    );
    expect(wrapper.exists(AmazonFutureEngineerEligibilityForm));
  });

  it('cannot continue on form without required fields', () => {
    let formProps = {
      email: 'test@test.com',
      schoolId: '123456789012',
      updateFormData: () => {}
    };

    const wrapper = shallow(
      <AmazonFutureEngineerEligibilityForm {...formProps} />
    );

    wrapper.find('#continue').simulate('click');

    expect(wrapper.state().errors).to.include.keys(
      'firstName',
      'lastName',
      'consentAFE'
    );
    expect(wrapper.find(AmazonFutureEngineerAccountConfirmation)).to.be.empty;
  });

  it('continues to account confirmation with required fields', () => {
    let formProps = {
      email: 'test@test.com',
      schoolId: '123456789012',
      updateFormData: () => {}
    };

    const wrapper = shallow(
      <AmazonFutureEngineerEligibilityForm {...formProps} />
    );

    // Assumes form controls appropriately update state
    // when user inputs first name, last name, and consents to sharing
    // information with AFE.
    wrapper.setState({
      firstName: 'testFirst',
      lastName: 'testLast',
      consentAFE: true
    });

    wrapper.find('#continue').simulate('click');

    expect(wrapper.exists(AmazonFutureEngineerAccountConfirmation));
  });
});
