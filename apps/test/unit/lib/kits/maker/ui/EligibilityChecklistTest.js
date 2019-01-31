import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../../../util/configuredChai';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import {Unit6Intention} from "@cdo/apps/lib/kits/maker/util/discountLogic";


describe('EligibilityChecklist', () => {
  const defaultProps = {
    statusPD: Status.SUCCEEDED,
    statusStudentCount: Status.SUCCEEDED,
    hasConfirmedSchool: false,
    adminSetStatus: false,
    currentlyDistributingDiscountCodes: true,
  };

  it('renders a div if we have no discountCode', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
      />
    );
    assert(wrapper.is('div'));
  });

  it('does not render Unit6ValidationStep until we answer school choice question', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').length, 0);
    wrapper.instance().handleSchoolConfirmed({schoolId: '1', fullDiscount: true});
    assert.equal(wrapper.find('Unit6ValidationStep').length, 1);
  });

  it('renders Unit6ValidationStep if we previously answered school choice question', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        hasConfirmedSchool
        schoolId="1"
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').length, 1);
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
    wrapper.instance().handleUnit6Submitted(true);
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('renders get code button if we previously confirmed school and unit 6 intention', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_18_19}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
        getsFullDiscount={false}
      />
    );
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('shows EligibilityConfirmDialog after clicking get code button', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_18_19}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
        getsFullDiscount={false}
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
        unit6Intention={Unit6Intention.YES_18_19}
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
        getsFullDiscount={false}
      />
    );
    wrapper.find('Button').simulate('click');
    wrapper.instance().handleSuccessDialog('MYCODE', '2018-12-31T00:00:00.000Z');
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('renders DiscountCodeInstructions if we previoulsy received a discountCode', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_18_19}
        initialDiscountCode="MYCODE"
        initialExpiration="2018-12-31T00:00:00.000Z"
        getsFullDiscount={false}
      />
    );
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('does not show Unit6ValidationStep when it has admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention={Unit6Intention.YES_18_19}
        adminSetStatus={true}
        getsFullDiscount={true}
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
        getsFullDiscount={true}
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
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('Button').props().text, 'Get Code');
  });
});
