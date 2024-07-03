import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import ChangeEmailForm from '@cdo/apps/lib/ui/accounts/ChangeEmailForm';



describe('ChangeEmailForm', () => {
  const EMAIL_SELECTOR = 'input[type="email"]';
  const PASSWORD_SELECTOR = 'input[type="password"]';
  const OPT_IN_SELECTOR = 'input[type="radio"][value="yes"]';
  const OPT_OUT_SELECTOR = 'input[type="radio"][value="no"]';

  const DEFAULT_PROPS = {
    values: {},
    validationErrors: {},
    userType: 'student',
    isPasswordRequired: true,
    onChange: () => {},
    onSubmit: () => {},
  };

  describe('the emailOptIn field', () => {
    it('is rendered for teachers', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="teacher" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).toBeDefined();
      expect(wrapper.find(OPT_OUT_SELECTOR)).toBeDefined();
    });

    it('is not rendered for students', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="student" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).toBeFalsy();
      expect(wrapper.find(OPT_OUT_SELECTOR)).toBeFalsy();
    });
  });

  describe('the password field', () => {
    describe('when password is required', () => {
      it('is rendered for teachers', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="teacher"
            isPasswordRequired={true}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).toBeDefined();
      });

      it('is rendered for students', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="student"
            isPasswordRequired={true}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).toBeDefined();
      });
    });

    describe('when password is not required', () => {
      it('is not rendered for teachers', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="teacher"
            isPasswordRequired={false}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).toBeFalsy();
      });

      it('is not rendered for students', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="student"
            isPasswordRequired={false}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).toBeFalsy();
      });
    });
  });

  describe('calls onChange', () => {
    let onChange, wrapper;

    const initialValues = {
      newEmail: 'initialEmail@example.com',
      currentPassword: 'initialPassword',
      emailOptIn: 'yes',
    };

    beforeEach(() => {
      onChange = sinon.spy();
      wrapper = mount(
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={initialValues}
          onChange={onChange}
        />
      );
    });

    it('when the email field changes', () => {
      expect(onChange).not.toHaveBeenCalled();

      const changedEmail = 'newEmail@example.com';
      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: changedEmail}});

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.firstCall.args[0]).toEqual({
        ...initialValues,
        newEmail: changedEmail,
      });
    });

    it('when the password field changes', () => {
      expect(onChange).not.toHaveBeenCalled();

      const changedPassword = 'differentPassword';
      wrapper
        .find(PASSWORD_SELECTOR)
        .simulate('change', {target: {value: changedPassword}});

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.firstCall.args[0]).toEqual({
        ...initialValues,
        currentPassword: changedPassword,
      });
    });

    it('when the email opt-in field changes', () => {
      wrapper.setProps({userType: 'teacher'});
      expect(onChange).not.toHaveBeenCalled();

      const changedOptIn = 'no';
      wrapper.find(OPT_OUT_SELECTOR).simulate('click');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.firstCall.args[0]).toEqual({
        ...initialValues,
        emailOptIn: changedOptIn,
      });
    });
  });

  describe('calls onSubmit', () => {
    let onSubmit, wrapper;

    beforeEach(() => {
      onSubmit = sinon.spy();
      wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} onSubmit={onSubmit} />
      );
    });

    it('when the enter key is pressed in the email field', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.firstCall.args).toHaveLength(0);
    });

    it('when the enter key is pressed in the password field', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(PASSWORD_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.firstCall.args).toHaveLength(0);
    });

    it('when the enter key is pressed on the opt-in field', () => {
      wrapper.setProps({userType: 'teacher'});
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.firstCall.args).toHaveLength(0);
    });

    it('but not when other keys are pressed', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'a'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Backspace'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Escape'});

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('and not when the form is disabled', () => {
      wrapper.setProps({userType: 'teacher'});
      wrapper.setProps({disabled: true});
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(PASSWORD_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('when disabled', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<ChangeEmailForm {...DEFAULT_PROPS} disabled />);
    });

    it('the email field is disabled', () => {
      expect(wrapper.find(EMAIL_SELECTOR)).to.have.attr('disabled');
    });

    it('the password field is disabled', () => {
      expect(wrapper.find(PASSWORD_SELECTOR)).to.have.attr('disabled');
    });

    it('the opt-in field is disabled', () => {
      wrapper.setProps({userType: 'teacher'});
      expect(wrapper.find(OPT_IN_SELECTOR)).to.have.attr('disabled');
      expect(wrapper.find(OPT_OUT_SELECTOR)).to.have.attr('disabled');
    });
  });

  describe('focusOnAnError()', () => {
    let wrapper, emailSpy, passwordSpy;

    beforeEach(() => {
      wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="teacher" />
      );
      emailSpy = sinon.stub(wrapper.find(EMAIL_SELECTOR).getDOMNode(), 'focus');
      passwordSpy = sinon.stub(
        wrapper.find(PASSWORD_SELECTOR).getDOMNode(),
        'focus'
      );
    });

    afterEach(() => {
      emailSpy.restore();
      passwordSpy.restore();
    });

    it('does nothing if there are no validation errors', () => {
      wrapper.setProps({
        validationErrors: {},
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.toHaveBeenCalled();
      expect(passwordSpy).not.toHaveBeenCalled();
    });

    it('focuses on the email field if there is an email validation error', () => {
      wrapper.setProps({
        validationErrors: {
          newEmail: 'Something is wrong with the email',
        },
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).toHaveBeenCalledTimes(1);
      expect(passwordSpy).not.toHaveBeenCalled();
    });

    it('focuses on the password field if there is a password validation error', () => {
      wrapper.setProps({
        validationErrors: {
          currentPassword: 'Something is wrong with the password',
        },
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.toHaveBeenCalled();
      expect(passwordSpy).toHaveBeenCalledTimes(1);
    });

    it('focuses on the email field if there are both email and password validation errors', () => {
      wrapper.setProps({
        validationErrors: {
          newEmail: 'Something is wrong with the email',
          currentPassword: 'Something is wrong with the password',
        },
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).toHaveBeenCalledTimes(1);
      expect(passwordSpy).not.toHaveBeenCalled();
    });
  });
});
