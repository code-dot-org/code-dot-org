import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {ChangeEmailForm} from '@cdo/apps/accounts/ChangeEmail/ChangeEmailForm';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

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
  };

  describe('the emailOptIn field', () => {
    it('is rendered for teachers', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="teacher" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).to.exist;
      expect(wrapper.find(OPT_OUT_SELECTOR)).to.exist;
    });

    it('is not rendered for students', () => {
      const wrapper = mount(
        <ChangeEmailForm {...DEFAULT_PROPS} userType="student" />
      );
      expect(wrapper.find(OPT_IN_SELECTOR)).not.to.exist;
      expect(wrapper.find(OPT_OUT_SELECTOR)).not.to.exist;
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
      expect(onChange).not.to.have.been.called;

      const changedEmail = 'newEmail@example.com';
      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: changedEmail}});

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        newEmail: changedEmail,
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
        currentPassword: changedPassword,
      });
    });

    it('when the email opt-in field changes', () => {
      wrapper.setProps({userType: 'teacher'});
      expect(onChange).not.to.have.been.called;

      const changedOptIn = 'no';
      wrapper.find(OPT_OUT_SELECTOR).simulate('change');

      expect(onChange).to.have.been.calledOnce;
      expect(onChange.firstCall.args[0]).to.deep.equal({
        ...initialValues,
        emailOptIn: changedOptIn,
      });
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

  describe('validation', () => {
    let wrapper;
    let newEmailValidation = 'email is required';
    let currentPasswordValidation = 'password is required';
    let emailOptInValidation = 'opt in selection is required';

    beforeEach(() => {
      wrapper = mount(
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          userType="teacher"
          validationErrors={{
            newEmail: newEmailValidation,
            currentPassword: currentPasswordValidation,
            emailOptIn: emailOptInValidation,
          }}
        />
      );
    });

    it('does not show validation on initial render', () => {
      expect(wrapper.contains(newEmailValidation)).to.be.false;
      expect(wrapper.contains(currentPasswordValidation)).to.be.false;
      expect(wrapper.contains(emailOptInValidation)).to.be.false;
    });

    it('onChange on email input reveals form validation', () => {
      expect(wrapper.contains(newEmailValidation)).to.be.false;
      expect(wrapper.contains(currentPasswordValidation)).to.be.false;
      expect(wrapper.contains(emailOptInValidation)).to.be.false;

      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: 'email@mail.com'}});

      expect(wrapper.contains(currentPasswordValidation)).to.be.true;
      expect(wrapper.contains(emailOptInValidation)).to.be.true;
    });

    it('onChange on password input reveals form validation', () => {
      expect(wrapper.contains(newEmailValidation)).to.be.false;
      expect(wrapper.contains(currentPasswordValidation)).to.be.false;
      expect(wrapper.contains(emailOptInValidation)).to.be.false;

      wrapper
        .find(PASSWORD_SELECTOR)
        .simulate('change', {target: {value: 'abc123'}});

      expect(wrapper.contains(newEmailValidation)).to.be.true;
      expect(wrapper.contains(emailOptInValidation)).to.be.true;
    });

    it('onChange on opt-in/out input reveals form validation', () => {
      expect(wrapper.contains(newEmailValidation)).to.be.false;
      expect(wrapper.contains(currentPasswordValidation)).to.be.false;
      expect(wrapper.contains(emailOptInValidation)).to.be.false;

      wrapper.find(OPT_IN_SELECTOR).simulate('change');

      expect(wrapper.contains(newEmailValidation)).to.be.true;
      expect(wrapper.contains(currentPasswordValidation)).to.be.true;
    });
  });
});
