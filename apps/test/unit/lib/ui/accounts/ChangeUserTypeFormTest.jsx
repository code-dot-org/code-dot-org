import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import ChangeUserTypeForm from '@cdo/apps/lib/ui/accounts/ChangeUserTypeForm';

describe('ChangeUserTypeForm', () => {
  const EMAIL_SELECTOR = 'input[type="email"]';
  const OPT_IN_SELECTOR = 'select';

  const DEFAULT_PROPS = {
    values: {},
    validationErrors: {},
    onChange: () => {},
    onSubmit: () => {}
  };

  describe('calls onChange', () => {
    let onChange, wrapper;

    const initialValues = {
      email: 'initialEmail@example.com',
      emailOptIn: 'no'
    };

    beforeEach(() => {
      onChange = sinon.spy();
      wrapper = mount(
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={initialValues}
          onChange={onChange}
        />
      );
    });

    it('when the email field changes', () => {
      expect(onChange).not.to.have.been.called;

      const changedEmail = 'currentEmail@example.com';
      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: changedEmail}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        email: changedEmail
      });
    });

    it('when the email opt-in field changes', () => {
      expect(onChange).not.to.have.been.called;

      const newOptIn = 'yes';
      wrapper
        .find(OPT_IN_SELECTOR)
        .simulate('change', {target: {value: newOptIn}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        emailOptIn: newOptIn
      });
    });
  });

  describe('calls onSubmit', () => {
    let onSubmit, wrapper;

    beforeEach(() => {
      onSubmit = sinon.spy();
      wrapper = mount(
        <ChangeUserTypeForm {...DEFAULT_PROPS} onSubmit={onSubmit} />
      );
    });

    it('when the enter key is pressed in the email field', () => {
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).to.have.been.calledOnce;
      expect(onSubmit.firstCall.args).to.be.empty;
    });

    it('when the enter key is pressed in email opt-in field', () => {
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).to.have.been.calledOnce;
      expect(onSubmit.firstCall.args).to.be.empty;
    });

    it('but not when other keys are pressed', () => {
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'a'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Backspace'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Escape'});

      expect(onSubmit).not.to.have.been.called;
    });

    it('and not when the form is disabled', () => {
      wrapper.setProps({disabled: true});
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).not.to.have.been.called;
    });
  });

  describe('when disabled', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<ChangeUserTypeForm {...DEFAULT_PROPS} disabled />);
    });

    it('the email field is disabled', () => {
      expect(wrapper.find(EMAIL_SELECTOR)).to.have.attr('disabled');
    });

    it('the email opt-in field is disabled', () => {
      expect(wrapper.find(OPT_IN_SELECTOR)).to.have.attr('disabled');
    });
  });

  describe('focusOnAnError()', () => {
    let wrapper, emailSpy;

    beforeEach(() => {
      wrapper = mount(<ChangeUserTypeForm {...DEFAULT_PROPS} />);
      emailSpy = sinon.stub(wrapper.find(EMAIL_SELECTOR).getDOMNode(), 'focus');
    });

    afterEach(() => {
      emailSpy.restore();
    });

    it('does nothing if there are no validation errors', () => {
      wrapper.setProps({
        validationErrors: {}
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.to.have.been.called;
    });

    it('focuses on the email field if there is an email validation error', () => {
      wrapper.setProps({
        validationErrors: {
          email: 'Something is wrong with the email'
        }
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).to.have.been.calledOnce;
    });
  });
});
