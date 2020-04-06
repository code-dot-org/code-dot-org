import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import AddParentEmailModal from '@cdo/apps/lib/ui/accounts/AddParentEmailModal';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

describe('AddParentEmailModal', () => {
  let wrapper;

  const EMAIL_SELECTOR = 'input[type="email"]';
  const RADIO_SELECTOR = 'input[type="radio"]';

  const DEFAULT_PROPS = {
    handleSubmit: () => {},
    handleCancel: () => {},
    userType: 'student',
    isPasswordRequired: true
  };

  // Helpers for selecting particular elements/components
  const emailInput = wrapper => wrapper.find(EMAIL_SELECTOR);
  const parentEmailOptInSelect = wrapper =>
    wrapper.find(RADIO_SELECTOR).filterWhere(n => n.prop('value') === 'yes');
  const parentEmailOptOutSelect = wrapper =>
    wrapper.find(RADIO_SELECTOR).filterWhere(n => n.prop('value') === 'no');
  const submitButton = wrapper =>
    wrapper
      .find(Button)
      .filterWhere(n => n.prop('text') === i18n.addParentEmailModal_save());
  const cancelButton = wrapper =>
    wrapper.find(Button).filterWhere(n => n.prop('text') === i18n.cancel());

  beforeEach(() => {
    wrapper = mount(<AddParentEmailModal {...DEFAULT_PROPS} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('add parent email', () => {
    it('disables everything and shows save text when saving', () => {
      wrapper.setState({saveState: 'saving'});
      expect(emailInput(wrapper)).to.have.attr('disabled');
      expect(parentEmailOptInSelect(wrapper)).to.have.attr('disabled');
      expect(parentEmailOptOutSelect(wrapper)).to.have.attr('disabled');
      expect(submitButton(wrapper)).to.have.attr('disabled');
      expect(cancelButton(wrapper)).to.have.attr('disabled');
      expect(wrapper.text()).to.include(i18n.saving());
    });

    it('shows unknown error text when an unknown error occurs', () => {
      wrapper.setState({saveState: 'unknown-error'});
      expect(wrapper.text()).to.include(
        i18n.changeEmailModal_unexpectedError()
      );
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
            parentEmail: '',
            parentEmailOptIn: 'yes'
          }
        });

        expect(wrapper.text()).to.include(
          i18n.addParentEmailModal_parentEmail_isRequired()
        );
      });

      it('checks that email is valid', () => {
        wrapper.setState({
          values: {
            parentEmail: 'invalidEmail@nowhere',
            parentEmailOptIn: 'yes'
          }
        });

        expect(wrapper.text()).to.include(
          i18n.addParentEmailModal_parentEmail_invalid()
        );
      });

      it('reports email server errors', () => {
        const serverError = 'test-server-error';
        wrapper.setState({
          values: {
            parentEmail: 'new@example.com',
            parentEmailOptIn: 'yes'
          },
          errors: {
            parentEmail: serverError
          }
        });

        expect(wrapper.text()).to.include(serverError);
      });

      it('reports parentEmailOptIn server errors', () => {
        const serverError = 'test-email-opt-in-server-error';
        wrapper.setState({
          values: {
            parentEmail: 'new@example.com',
            parentEmailOptIn: 'yes'
          },
          errors: {
            parentEmailOptIn: serverError
          }
        });

        expect(wrapper.text()).to.include(serverError);
      });

      it('disables the submit button when validation errors are present', () => {
        wrapper.setState({
          values: {
            parentEmail: '',
            parentEmailOptIn: ''
          }
        });

        expect(submitButton(wrapper)).to.have.prop('disabled', true);
      });

      it('enables the submit button form passes validation', () => {
        wrapper.setState({
          values: {
            parentEmail: 'me@example.com',
            parentEmailOptIn: 'yes'
          }
        });

        expect(submitButton(wrapper)).to.have.prop('disabled', false);
      });
    });

    describe('changes clear server errors', () => {
      it('on email', () => {
        wrapper.setState({
          errors: {
            parentEmail: 'test-server-error'
          }
        });
        expect(wrapper.state().errors.parentEmail).to.equal(
          'test-server-error'
        );
        emailInput(wrapper).simulate('change', {
          target: {value: 'me@example.com'}
        });
        expect(wrapper.state().errors.parentEmail).to.be.undefined;
      });

      it('on parentEmailOptIn', () => {
        wrapper.setState({
          errors: {
            parentEmailOptIn: 'test-server-error'
          }
        });
        expect(wrapper.state().errors.parentEmailOptIn).to.equal(
          'test-server-error'
        );
        parentEmailOptOutSelect(wrapper).simulate('change');
        expect(wrapper.state().errors.parentEmailOptIn).to.be.undefined;
      });
    });

    describe('onSubmitFailure', () => {
      it('puts the dialog in UNKNOWN ERROR state if response has no server errors', () => {
        expect(wrapper.state().saveState).to.equal('initial');
        wrapper.instance().onSubmitFailure(null, {});
        expect(wrapper.state().saveState).to.equal('unknown-error');
      });

      it('loads returned validation errors into dialog state', () => {
        expect(wrapper.state().saveState).to.equal('initial');
        expect(wrapper.state().errors).to.deep.equal({
          parentEmail: '',
          parentEmailOptIn: ''
        });
        wrapper.instance().onSubmitFailure({
          serverErrors: {
            parentEmail: 'test-email-server-error',
            parentEmailOptIn: 'test-email-opt-in-server-error'
          }
        });
        expect(wrapper.state().saveState).to.equal('initial');
        expect(wrapper.state().errors).to.deep.equal({
          parentEmail: 'test-email-server-error',
          parentEmailOptIn: 'test-email-opt-in-server-error'
        });
      });
    });
  });
});
