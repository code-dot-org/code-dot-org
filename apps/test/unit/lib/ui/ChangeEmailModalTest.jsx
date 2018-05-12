import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import ChangeEmailModal, {hashEmail} from '@cdo/apps/lib/ui/ChangeEmailModal';
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

  const emailInput = wrapper => wrapper.find(EMAIL_SELECTOR);
  const passwordInput = wrapper => wrapper.find(PASSWORD_SELECTOR);

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
    wrapper.find(Button).forEach((button) => {
      expect(button).to.have.prop('disabled', true);
    });
    expect(wrapper.text()).to.include(i18n.saving());
  });

  it('disables everything and shows save text when saving', () => {
    wrapper.setState({saveState: 'unknown-error'});
    expect(wrapper.text()).to.include(i18n.changeEmailModal_unexpectedError());
  });

  it('calls handleCancel when clicking the cancel button', () => {
    const handleCancel = sinon.spy();
    wrapper.setProps({handleCancel});
    expect(handleCancel).not.to.have.been.called;
    wrapper.find(Button)
      .filterWhere(n => n.prop('text') === i18n.cancel())
      .simulate('click');
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

      expect(wrapper.text()).to.include(i18n.changeEmailmodal_newEmail_mustBeDifferent());
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

      const submitButton = wrapper.find(Button)
        .filterWhere(n => n.prop('text') === i18n.changeEmailModal_save());
      expect(submitButton).to.have.prop('disabled', true);
    });

    it('enables the submit button form passes validation', () => {
      wrapper.setState({
        values: {
          newEmail: 'me@example.com',
          currentPassword: 'fakepassword'
        }
      });

      const submitButton = wrapper.find(Button)
        .filterWhere(n => n.prop('text') === i18n.changeEmailModal_save());
      expect(submitButton).to.have.prop('disabled', false);
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
});
