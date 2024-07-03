import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ChangeUserTypeForm from '@cdo/apps/lib/ui/accounts/ChangeUserTypeForm';



describe('ChangeUserTypeForm', () => {
  const EMAIL_SELECTOR = 'input[type="email"]';
  const OPT_IN_SELECTOR = 'select';

  const DEFAULT_PROPS = {
    values: {},
    validationErrors: {},
    onChange: () => {},
    onSubmit: () => {},
  };

  describe('calls onChange', () => {
    let onChange, wrapper;

    const initialValues = {
      email: 'initialEmail@example.com',
      emailOptIn: 'no',
    };

    beforeEach(() => {
      onChange = jest.fn();
      wrapper = mount(
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={initialValues}
          onChange={onChange}
        />
      );
    });

    it('when the email field changes', () => {
      expect(onChange).not.toHaveBeenCalled();

      const changedEmail = 'currentEmail@example.com';
      wrapper
        .find(EMAIL_SELECTOR)
        .simulate('change', {target: {value: changedEmail}});

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual({
        ...initialValues,
        email: changedEmail,
      });
    });

    it('when the email opt-in field changes', () => {
      expect(onChange).not.toHaveBeenCalled();

      const newOptIn = 'yes';
      wrapper
        .find(OPT_IN_SELECTOR)
        .simulate('change', {target: {value: newOptIn}});

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual({
        ...initialValues,
        emailOptIn: newOptIn,
      });
    });
  });

  describe('calls onSubmit', () => {
    let onSubmit, wrapper;

    beforeEach(() => {
      onSubmit = jest.fn();
      wrapper = mount(
        <ChangeUserTypeForm {...DEFAULT_PROPS} onSubmit={onSubmit} />
      );
    });

    it('when the enter key is pressed in the email field', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]).toHaveLength(0);
    });

    it('when the enter key is pressed in email opt-in field', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]).toHaveLength(0);
    });

    it('but not when other keys are pressed', () => {
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'a'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Backspace'});
      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Escape'});

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('and not when the form is disabled', () => {
      wrapper.setProps({disabled: true});
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.find(EMAIL_SELECTOR).simulate('keydown', {key: 'Enter'});
      wrapper.find(OPT_IN_SELECTOR).simulate('keydown', {key: 'Enter'});

      expect(onSubmit).not.toHaveBeenCalled();
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
      emailSpy = jest.spyOn(wrapper.find(EMAIL_SELECTOR).getDOMNode(), 'focus').mockClear().mockImplementation();
    });

    afterEach(() => {
      emailSpy.mockRestore();
    });

    it('does nothing if there are no validation errors', () => {
      wrapper.setProps({
        validationErrors: {},
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('focuses on the email field if there is an email validation error', () => {
      wrapper.setProps({
        validationErrors: {
          email: 'Something is wrong with the email',
        },
      });

      wrapper.instance().focusOnAnError();
      expect(emailSpy).toHaveBeenCalledTimes(1);
    });
  });
});
