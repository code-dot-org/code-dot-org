import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import ChangeEmailModal from '@cdo/apps/lib/ui/ChangeEmailModal';
import {hashEmail} from '@cdo/apps/code-studio/hashEmail';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

describe('ChangeEmailModal', () => {
  let wrapper, form, defaultProps;

  const EMAIL_SELECTOR = 'input[type="email"]';
  const PASSWORD_SELECTOR = 'input[type="password"]';

  const STATIC_DEFAULT_PROPS = {
    isOpen: true,
    handleSubmit: () => {},
    handleCancel: () => {},
    userAge: 21,
  };

  // Helpers for selecting particular elements/components
  const emailInput = wrapper => wrapper.find(EMAIL_SELECTOR);
  const passwordInput = wrapper => wrapper.find(PASSWORD_SELECTOR);
  const submitButton = wrapper => wrapper.find(Button)
    .filterWhere(n => n.prop('text') === i18n.changeEmailModal_save());
  const cancelButton = wrapper => wrapper.find(Button)
    .filterWhere(n => n.prop('text') === i18n.cancel());

  beforeEach(() => {
    form = document.createElement('form');
    defaultProps = {
      ...STATIC_DEFAULT_PROPS,
      railsForm: form,
    };
    wrapper = mount(
      <ChangeEmailModal {...defaultProps}/>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('disables everything and shows save text when saving', () => {
    wrapper.setState({saveState: 'saving'});
    expect(emailInput(wrapper)).to.have.attr('disabled');
    expect(passwordInput(wrapper)).to.have.attr('disabled');
    expect(submitButton(wrapper)).to.have.attr('disabled');
    expect(cancelButton(wrapper)).to.have.attr('disabled');
    expect(wrapper.text()).to.include(i18n.saving());
  });

  it('shows unknown error text when an unknown error occurs', () => {
    wrapper.setState({saveState: 'unknown-error'});
    expect(wrapper.text()).to.include(i18n.changeEmailModal_unexpectedError());
  });

  it('calls handleCancel when clicking the cancel button', () => {
    const handleCancel = sinon.spy();
    wrapper.setProps({handleCancel});
    expect(handleCancel).not.to.have.been.called;
    cancelButton(wrapper).simulate('click');
    expect(handleCancel).to.have.been.calledOnce;
  });

  describe('validation', () => {
    it('checks that email is present', () => {
      wrapper.setState({
        values: {
          newEmail: '',
          currentPassword: ''
        }
      });

      expect(wrapper.text()).to.include(i18n.changeEmailModal_newEmail_isRequired());
    });

    it('checks that email is valid', () => {
      wrapper.setState({
        values: {
          newEmail: 'invalidEmail@nowhere',
          currentPassword: ''
        }
      });

      expect(wrapper.text()).to.include(i18n.changeEmailModal_newEmail_invalid());
    });

    it('checks that email is not the same as the current email', () => {
      const email = 'validEmail@example.com';
      const hashedEmail = hashEmail(email);
      wrapper.setProps({currentHashedEmail: hashedEmail});
      wrapper.setState({
        values: {
          newEmail: email,
          currentPassword: ''
        }
      });

      expect(wrapper.text()).to.include(i18n.changeEmailModal_newEmail_mustBeDifferent());
    });

    it('reports email server errors', () => {
      const serverError = 'test-server-error';
      wrapper.setState({
        values: {
          newEmail: '',
          currentPassword: ''
        },
        serverErrors: {
          newEmail: serverError,
        }
      });

      expect(wrapper.text()).to.include(serverError);
    });

    it('checks that password is present', () => {
      wrapper.setState({
        values: {
          newEmail: '',
          currentPassword: ''
        }
      });

      expect(wrapper.text()).to.include(i18n.changeEmailModal_currentPassword_isRequired());
    });

    it('reports password server errors', () => {
      const serverError = 'test-password-server-error';
      wrapper.setState({
        values: {
          newEmail: '',
          currentPassword: ''
        },
        serverErrors: {
          currentPassword: serverError,
        }
      });

      expect(wrapper.text()).to.include(serverError);
    });

    it('disables the submit button when validation errors are present', () => {
      wrapper.setState({
        values: {
          newEmail: '',
          currentPassword: ''
        }
      });

      expect(submitButton(wrapper)).to.have.prop('disabled', true);
    });

    it('enables the submit button form passes validation', () => {
      wrapper.setState({
        values: {
          newEmail: 'me@example.com',
          currentPassword: 'fakepassword'
        }
      });

      expect(submitButton(wrapper)).to.have.prop('disabled', false);
    });
  });

  describe('changes clear server errors', () => {
    it('on email', () => {
      wrapper.setState({
        serverErrors: {
          newEmail: 'test-server-error',
        }
      });
      expect(wrapper.state().serverErrors.newEmail).to.equal('test-server-error');
      emailInput(wrapper).simulate('change', {target:{value:'me@example.com'}});
      expect(wrapper.state().serverErrors.newEmail).to.be.undefined;
    });

    it('on password', () => {
      wrapper.setState({
        serverErrors: {
          currentPassword: 'test-server-error',
        }
      });
      expect(wrapper.state().serverErrors.currentPassword).to.equal('test-server-error');
      passwordInput(wrapper).simulate('change', {target:{value:'fakepassword'}});
      expect(wrapper.state().serverErrors.currentPassword).to.be.undefined;
    });
  });

  describe('onSubmitSuccess', () => {
    it('calls handleSubmit with the new email', () => {
      const testEmail = 'me@example.com';
      const handleSubmit = sinon.spy();
      wrapper.setProps({handleSubmit});
      wrapper.setState({
        values: {
          newEmail: testEmail,
          currentPassword: '',
        }
      });

      expect(handleSubmit).not.to.have.been.called;
      wrapper.instance().onSubmitSuccess();
      expect(handleSubmit).to.have.been.calledOnce.and.calledWith(testEmail);
    });
  });

  describe('onSubmitFailure', () => {
    it('puts the dialog in UNKNOWN ERROR state if response has no JSON', () => {
      expect(wrapper.state().saveState).to.equal('initial');
      wrapper.instance().onSubmitFailure(null, {});
      expect(wrapper.state().saveState).to.equal('unknown-error');
    });

    it('loads returned validation errors into dialog state', () => {
      expect(wrapper.state().saveState).to.equal('initial');
      expect(wrapper.state().serverErrors).to.deep.equal({
        newEmail: '',
        currentPassword: '',
      });
      wrapper.instance().onSubmitFailure(null, {
        responseJSON: {
          email: ['test-email-server-error'],
          current_password: ['test-password-server-error']
        }
      });
      expect(wrapper.state().saveState).to.equal('initial');
      expect(wrapper.state().serverErrors).to.deep.equal({
        newEmail: 'test-email-server-error',
        currentPassword: 'test-password-server-error',
      });
    });
  });
});
