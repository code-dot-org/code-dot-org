import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import ChangeEmailForm from '@cdo/apps/lib/ui/accounts/ChangeEmailForm';

describe('ChangeEmailForm', () => {
  const EMAIL_SELECTOR = 'input[type="email"]';
  const PASSWORD_SELECTOR = 'input[type="password"]';
  const OPT_IN_SELECTOR = 'select';

  const DEFAULT_PROPS = {
    values: {},
    validationErrors: {},
    userType: 'student',
    isPasswordRequired: true,
    onChange: () => {},
    onSubmit: () => {}
  };

  describe('the emailOptIn field', () => {
    it('is rendered for teachers', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="teacher" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).to.exist;
    });

    it('is not rendered for students', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="student" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).not.to.exist;
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
        expect(wrapper.find(PASSWORD_SELECTOR)).to.exist;
      });

      it('is rendered for students', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="student"
            isPasswordRequired={true}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).to.exist;
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
        expect(wrapper.find(PASSWORD_SELECTOR)).not.to.exist;
      });

      it('is not rendered for students', () => {
        const wrapper = mount(
          <ChangeEmailForm
            {...DEFAULT_PROPS}
            userType="student"
            isPasswordRequired={false}
          />
        );
        expect(wrapper.find(PASSWORD_SELECTOR)).not.to.exist;
      });
    });
  });

  describe('calls onChange', () => {
    let onChange, wrapper;

    const initialValues = {
      newEmail: 'initialEmail@example.com',
      currentPassword: 'initialPassword',
      emailOptIn: 'yes'
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
      expect(onChange).not.to.have.been.called;

      const changedEmail = 'newEmail@example.com';
      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: changedEmail}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        newEmail: changedEmail
      });
    });

    it('when the password field changes', () => {
      expect(onChange).not.to.have.been.called;

      const changedPassword = 'differentPassword';
      wrapper
        .find(PASSWORD_SELECTOR)
        .simulate('change', {target: {value: changedPassword}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        currentPassword: changedPassword
      });
    });

    it('when the email opt-in field changes', () => {
      wrapper.setProps({userType: 'teacher'});
      expect(onChange).not.to.have.been.called;

      const changedOptIn = 'no';
      wrapper
        .find(OPT_IN_SELECTOR)
        .simulate('change', {target: {value: changedOptIn}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        emailOptIn: changedOptIn
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
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).to.have.been.calledOnce;
      expect(onSubmit.firstCall.args).to.be.empty;
    });

    it('when the enter key is pressed in the password field', () => {
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(PASSWORD_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).to.have.been.calledOnce;
      expect(onSubmit.firstCall.args).to.be.empty;
    });

    it('when the enter key is pressed on the opt-in field', () => {
      wrapper.setProps({userType: 'teacher'});
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
      wrapper.setProps({userType: 'teacher'});
      wrapper.setProps({disabled: true});
      expect(onSubmit).not.to.have.been.called;

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(PASSWORD_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).not.to.have.been.called;
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
    });
  });

  describe('focusOnAnError()', () => {
    let wrapper, emailSpy, passwordSpy, optInSpy;

    beforeEach(() => {
      wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="teacher" />
      );
      emailSpy = sinon.stub(wrapper.find(EMAIL_SELECTOR).getDOMNode(), 'focus');
      passwordSpy = sinon.stub(
        wrapper.find(PASSWORD_SELECTOR).getDOMNode(),
        'focus'
      );
      optInSpy = sinon.stub(
        wrapper.find(OPT_IN_SELECTOR).getDOMNode(),
        'focus'
      );
    });

    afterEach(() => {
      emailSpy.restore();
      passwordSpy.restore();
      optInSpy.restore();
    });

    it('does nothing if there are no validation errors', () => {
      wrapper.setProps({
        validationErrors: {}
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.to.have.been.called;
      expect(passwordSpy).not.to.have.been.called;
      expect(optInSpy).not.to.have.been.called;
    });

    it('focuses on the email field if there is an email validation error', () => {
      wrapper.setProps({
        validationErrors: {
          newEmail: 'Something is wrong with the email'
        }
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).to.have.been.calledOnce;
      expect(passwordSpy).not.to.have.been.called;
      expect(optInSpy).not.to.have.been.called;
    });

    it('focuses on the password field if there is a password validation error', () => {
      wrapper.setProps({
        validationErrors: {
          currentPassword: 'Something is wrong with the password'
        }
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.to.have.been.called;
      expect(passwordSpy).to.have.been.calledOnce;
      expect(optInSpy).not.to.have.been.called;
    });

    it('focuses on the email field if there are both email and password validation errors', () => {
      wrapper.setProps({
        validationErrors: {
          newEmail: 'Something is wrong with the email',
          currentPassword: 'Something is wrong with the password'
        }
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).to.have.been.calledOnce;
      expect(passwordSpy).not.to.have.been.called;
      expect(optInSpy).not.to.have.been.called;
    });
  });
});
