import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import ChangeUserTypeModal from '@cdo/apps/lib/ui/accounts/ChangeUserTypeModal';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';



describe('ChangeUserTypeModal', () => {
  let wrapper;

  const EMAIL_SELECTOR = 'input[type="email"]';
  const EMAIL_OPT_IN_SELECTOR = 'select';

  const DEFAULT_PROPS = {
    handleSubmit: () => {},
    handleCancel: () => {},
  };

  // Helpers for selecting particular elements/components
  const emailInput = wrapper => wrapper.find(EMAIL_SELECTOR);
  const emailOptInSelect = wrapper => wrapper.find(EMAIL_OPT_IN_SELECTOR);
  const submitButton = wrapper =>
    wrapper
      .find(Button)
      .filterWhere(
        n => n.prop('text') === i18n.changeUserTypeModal_save_teacher()
      );
  const cancelButton = wrapper =>
    wrapper.find(Button).filterWhere(n => n.prop('text') === i18n.cancel());

  beforeEach(() => {
    wrapper = mount(<ChangeUserTypeModal {...DEFAULT_PROPS} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('disables everything and shows save text when saving', () => {
    wrapper.setState({saveState: 'saving'});
    expect(emailInput(wrapper)).to.have.attr('disabled');
    expect(emailOptInSelect(wrapper)).to.have.attr('disabled');
    expect(submitButton(wrapper)).to.have.attr('disabled');
    expect(cancelButton(wrapper)).to.have.attr('disabled');
    expect(wrapper.text()).toContain(i18n.saving());
  });

  it('shows unknown error text when an unknown error occurs', () => {
    wrapper.setState({saveState: 'unknown-error'});
    expect(wrapper.text()).toContain(i18n.changeUserTypeModal_unexpectedError());
  });

  it('calls handleCancel when clicking the cancel button', () => {
    const handleCancel = sinon.spy();
    wrapper.setProps({handleCancel});
    expect(handleCancel).not.toHaveBeenCalled();
    cancelButton(wrapper).simulate('click');
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  describe('validation', () => {
    it('checks that email is present', () => {
      wrapper.setState({
        values: {
          email: '',
          emailOptIn: 'yes',
        },
      });

      expect(wrapper.text()).toContain(i18n.changeUserTypeModal_email_isRequired());
    });

    it('checks that email is valid', () => {
      wrapper.setState({
        values: {
          email: 'invalidEmail@nowhere',
          emailOptIn: 'yes',
        },
      });

      expect(wrapper.text()).toContain(i18n.changeUserTypeModal_email_invalid());
    });

    it('reports email server errors', () => {
      const serverError = 'test-server-error';
      wrapper.setState({
        values: {
          email: '',
          emailOptIn: 'yes',
        },
        serverErrors: {
          email: serverError,
        },
      });

      expect(wrapper.text()).toContain(serverError);
    });

    it('checks that email opt-in is present', () => {
      const email = 'validEmail@example.com';
      wrapper.setState({
        values: {
          email: email,
          emailOptIn: '',
        },
      });

      expect(wrapper.text()).toContain(i18n.changeUserTypeModal_emailOptIn_isRequired());
    });

    it('reports email opt-in server errors', () => {
      const email = 'validEmail@example.com';
      const serverError = 'test-email-opt-in-server-error';
      wrapper.setState({
        values: {
          email: email,
          emailOptIn: '',
        },
        serverErrors: {
          emailOptIn: serverError,
        },
      });

      expect(wrapper.text()).toContain(serverError);
    });

    it('disables the submit button when validation errors are present', () => {
      wrapper.setState({
        values: {
          email: '',
          emailOptIn: '',
        },
      });

      expect(submitButton(wrapper).props()).toHaveProperty('disabled', true);
    });

    it('enables the submit button when form passes validation', () => {
      wrapper.setState({
        values: {
          email: 'me@example.com',
          emailOptIn: 'yes',
        },
      });

      expect(submitButton(wrapper).props()).toHaveProperty('disabled', false);
    });
  });

  describe('changes clear server errors', () => {
    it('on email', () => {
      wrapper.setState({
        serverErrors: {
          email: 'test-server-error',
        },
      });
      expect(wrapper.state().serverErrors.email).toBe('test-server-error');
      emailInput(wrapper).simulate('change', {
        target: {value: 'me@example.com'},
      });
      expect(wrapper.state().serverErrors.email).toBeUndefined();
    });

    it('on email opt-in', () => {
      wrapper.setState({
        serverErrors: {
          emailOptIn: 'test-server-error',
        },
      });
      expect(wrapper.state().serverErrors.emailOptIn).toBe('test-server-error');
      emailOptInSelect(wrapper).simulate('change', {target: {value: 'yes'}});
      expect(wrapper.state().serverErrors.emailOptIn).toBeUndefined();
    });
  });

  describe('onSubmitFailure', () => {
    it('puts the dialog in UNKNOWN ERROR state if response has no server errors', () => {
      expect(wrapper.state().saveState).toBe('initial');
      wrapper.instance().onSubmitFailure(null, {});
      expect(wrapper.state().saveState).toBe('unknown-error');
    });

    it('loads returned validation errors into dialog state', () => {
      expect(wrapper.state().saveState).toBe('initial');
      expect(wrapper.state().serverErrors).toEqual({
        email: undefined,
        emailOptIn: undefined,
      });
      wrapper.instance().onSubmitFailure({
        serverErrors: {
          email: 'test-email-server-error',
          emailOptIn: 'test-opt-in-server-error',
        },
      });
      expect(wrapper.state().saveState).toBe('initial');
      expect(wrapper.state().serverErrors).toEqual({
        email: 'test-email-server-error',
        emailOptIn: 'test-opt-in-server-error',
      });
    });
  });
});
