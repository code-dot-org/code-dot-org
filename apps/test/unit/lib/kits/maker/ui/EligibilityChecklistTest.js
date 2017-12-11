import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../../../util/configuredChai';
import EligibilityChecklist from '@cdo/apps/lib/kits/maker/ui/EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import i18n from "@cdo/locale";


describe('EligibilityChecklist', () => {
  const defaultProps = {
    statusPD: Status.SUCCEEDED,
    statusStudentCount: Status.SUCCEEDED,
    hasConfirmedSchool: false,
    adminSetStatus: false,
  };

  it('renders a div if we have no discountCode', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
      />
    );
    assert(wrapper.is('div'));
  });

  it('does not render DiscountCodeSchoolChoice until we answer unit6 question', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('DiscountCodeSchoolChoice').length, 0);
    wrapper.instance().handleUnit6Submitted(true);
    assert.equal(wrapper.find('DiscountCodeSchoolChoice').length, 1);
  });

  it('renders DiscountCodeSchoolChoice if we previously answered unit6 question', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="yes1718"
      />
    );
    assert.equal(wrapper.find('DiscountCodeSchoolChoice').length, 1);
  });

  it('does not render get code button until we confirm school', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="yes1718"
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={false}
      />
    );
    assert.equal(wrapper.find('Button').length, 0);
    wrapper.instance().handleSchoolConfirmed(true);
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('renders get code button if we previously confirmed school', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="yes1718"
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
        unit6Intention="yes1718"
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
        unit6Intention="yes1718"
        schoolId="12345"
        schoolName="Code.org Junior Academy"
        hasConfirmedSchool={true}
      />
    );
    wrapper.find('Button').simulate('click');
    wrapper.instance().handleSuccessDialog('MYCODE');
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('renders DiscountCodeInstructions if we previoulsy received a discountCode', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="yes1718"
        initialDiscountCode="MYCODE"
      />
    );
    assert(wrapper.is('DiscountCodeInstructions'));
  });

  it('does not show Unit6ValidationStep radio buttons when it has admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="yes1718"
        adminSetStatus={true}
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').props().showRadioButtons, false);
  });

  it('claims unit6 success when it has admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="no"
        adminSetStatus={true}
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('Unit6ValidationStep').props().stepStatus, Status.SUCCEEDED);
  });

  it('shows button to get code when admin override with full discount', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="no"
        adminSetStatus={true}
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('Button').props().text, 'Get Code for $0 kit');
  });

  it('shows button to get code when admin override with partial discount', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="no"
        adminSetStatus={true}
        getsFullDiscount={false}
      />
    );
    assert.equal(wrapper.find('Button').props().text, 'Get Code for $97.50 kit');
  });

  it('shows message about subsidized kits when admin override', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
        unit6Intention="no"
        adminSetStatus={true}
        getsFullDiscount={true}
      />
    );
    assert.equal(wrapper.find('div').last().text(), i18n.eligibilityReqYearFail());
  });
});
