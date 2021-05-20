import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../../../util/deprecatedChai';
import sinon from 'sinon';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import {Unit6Intention} from '@cdo/apps/lib/kits/maker/util/discountLogic';

describe('EligibilityChecklist', () => {
  const defaultProps = {
    statusPD: Status.SUCCEEDED,
    statusStudentCount: Status.SUCCEEDED,
    hasConfirmedSchool: false,
    adminSetStatus: false,
    currentlyDistributingDiscountCodes: true
  };

  let clock;

  afterEach(function() {
    if (clock) {
      clock.restore();
      clock = undefined;
    }
  });

  it('renders a div if we have no discountCode', () => {
    const wrapper = shallow(<EligibilityChecklist {...defaultProps} />);
    assert(wrapper.is('div'));
  });

  it('does not render Unit6ValidationStep until we answer school choice question', () => {
    const wrapper = shallow(<EligibilityChecklist {...defaultProps} />);
    assert.equal(wrapper.find('Unit6ValidationStep').length, 0);
    wrapper
      .instance()
      .handleSchoolConfirmed({schoolId: '1', schoolHighNeedsEligible: true});
    assert.equal(wrapper.find('Unit6ValidationStep').length, 1);
  });

  it('renders Unit6ValidationStep if we previously answered school choice question and are high needs', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        hasConfirmedSchool
        schoolId="1"
        schoolHighNeedsEligible={true}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').length, 1);
  });

  it('renders Unit6ValidationStep if we previously answered school choice question and are not high needs', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        hasConfirmedSchool
        schoolId="1"
        schoolHighNeedsEligible={false}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').length, 1);
  });

  it('does not show submit button for Unit6ValidationStep if school is ineligible', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        hasConfirmedSchool
        schoolId="1"
        schoolHighNeedsEligible={false}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
  });

  it('does not render get code button until we confirm school and unit 6 intention', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
    wrapper.instance().handleUnit6Submitted({
      eligible: true,
      unit6Intention: Unit6Intention.YES_SPRING_2020
    });
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('does not render get code button if not in discount eligibility window', () => {
    clock = sinon.useFakeTimers(new Date('2020-05-01'));

    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
    wrapper.instance().handleUnit6Submitted({
      eligible: true,
      unit6Intention: Unit6Intention.YES_FALL_2020
    });
    assert.equal(wrapper.find('Button').length, 0);
  });

  it('renders get code button if in discount eligibility window that is not today', () => {
    clock = sinon.useFakeTimers(new Date('2020-12-01'));

    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
    wrapper.instance().handleUnit6Submitted({
      eligible: true,
      unit6Intention: Unit6Intention.YES_SPRING_2021
    });
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('renders get code button if we previously confirmed school and unit 6 intention', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_SPRING_2020}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('shows EligibilityConfirmDialog after clicking get code button', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_SPRING_2020}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    assert.equal(wrapper.find('EligibilityConfirmDialog').length, 0);
    wrapper.find('Button').simulate('click');
    assert.equal(wrapper.find('EligibilityConfirmDialog').length, 1);
    wrapper.instance().handleCancelDialog();
  });

  it('renders DiscountCodeInstructions upon completion of dialog', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_SPRING_2020}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    wrapper.find('Button').simulate('click');
    wrapper
      .instance()
      .handleSuccessDialog('MYCODE', '2018-12-31T00:00:00.000Z');
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('renders DiscountCodeInstructions if we previously received a discountCode', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_SPRING_2020}
        initialDiscountCode="MYCODE"
        initialExpiration="2018-12-31T00:00:00.000Z"
      />
    );
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('does not show Unit6ValidationStep when it has admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_SPRING_2020}
        adminSetStatus={true}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').length, 0);
  });

  it('claims unit6 success when it has admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.NO}
        adminSetStatus={true}
      />
    );
    assert.equal(wrapper.state().statusYear, Status.SUCCEEDED);
  });

  it('shows button to get code when admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.NO}
        adminSetStatus={true}
      />
    );
    assert.equal(wrapper.find('Button').props().text, 'Get Code');
  });
});
