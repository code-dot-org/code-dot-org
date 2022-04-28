import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PasswordReset from '@cdo/apps/templates/manageStudents/PasswordReset';
import sinon from 'sinon';

describe('PasswordReset', () => {
  let clock;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
  });

  it('disables reset password button if resetDisabled prop is true', () => {
    let wrapper = mount(<PasswordReset />);
    expect(wrapper.find('Button').prop('disabled')).to.equal(undefined);

    wrapper = mount(<PasswordReset resetDisabled={true} />);
    expect(wrapper.find('Button').prop('disabled')).to.be.true;
  });

  it('calls props.setPasswordLengthFailure with true if setting password fails with too short error', async () => {
    const setPasswordLengthFailureSpy = sinon.spy();
    const fetchStub = sinon.stub(window, 'fetch');
    fetchStub.returns(
      Promise.resolve({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            '{"errors":["Password is too short (minimum is 6 characters)"]}'
          )
      })
    );

    const wrapper = mount(
      <PasswordReset setPasswordLengthFailure={setPasswordLengthFailureSpy} />
    );
    wrapper.find('Button').simulate('click');
    wrapper.find('input').simulate('change', {
      target: {value: 'short'}
    });
    const saveButton = wrapper.find('Button').first();
    saveButton.simulate('click');
    await clock.runAllAsync();
    expect(setPasswordLengthFailureSpy).to.have.been.calledWith(true);
  });
});
