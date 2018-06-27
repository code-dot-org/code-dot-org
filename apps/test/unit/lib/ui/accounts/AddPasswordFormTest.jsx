import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import AddPasswordForm, {SAVING_STATE, SUCCESS_STATE, PASSWORDS_MUST_MATCH} from '@cdo/apps/lib/ui/accounts/AddPasswordForm';

describe('AddPasswordForm', () => {
  let wrapper, handleSubmit;

  beforeEach(() => {
    handleSubmit = () => {};
    wrapper = mount(
      <AddPasswordForm
        handleSubmit={handleSubmit}
      />
    );
  });

  it('enables form submission if passwords are present and match', () => {
    wrapper.setState({
      password: 'mypassword',
      passwordConfirmation: 'mypassword'
    });
    const submitButton = wrapper.find('button');
    expect(submitButton).not.to.have.attr('disabled');
  });

  it('disables form submission if passwords are empty', () => {
    wrapper.setState({
      password: '',
      passwordConfirmation: ''
    });
    expect(wrapper.find('button')).to.have.attr('disabled');
  });

  it('disables form submission if passwords do not match', () => {
    wrapper.setState({
      password: 'newpassword',
      passwordConfirmation: 'notnewpassword'
    });
    expect(wrapper.find('button')).to.have.attr('disabled');
  });

  it('renders a password mismatch validation error if passwords do not match', () => {
    wrapper.setState({
      password: 'newpassword',
      passwordConfirmation: 'notnewpassword'
    });
    expect(wrapper.find('FieldError')).to.have.text(PASSWORDS_MUST_MATCH);
  });

  it('renders the form submission state', () => {
    wrapper.setState({
      submissionState: {message: SAVING_STATE}
    });
    expect(wrapper.find('#uitest-add-password-status')).to.have.text(SAVING_STATE);
  });

  describe('on successful submission', () => {
    beforeEach(async () => {
      handleSubmit = sinon.stub().resolves({});
      wrapper = mount(
        <AddPasswordForm
          handleSubmit={handleSubmit}
        />
      );
      wrapper.setState({
        password: 'mypassword',
        passwordConfirmation: 'mypassword'
      });
      const submitButton = wrapper.find('button');
      submitButton.simulate('click');
      await handleSubmit;
    });

    it('resets the password field to its default state', async () => {
      const passwordField = wrapper.find('input').at(0);
      expect(passwordField).to.have.value('');
    });

    it('resets the password confirmation field to its default state', async () => {
      const passwordConfirmationField = wrapper.find('input').at(1);
      expect(passwordConfirmationField).to.have.value('');
    });

    it('renders the success state', async () => {
      expect(wrapper.find('#uitest-add-password-status')).to.have.text(SUCCESS_STATE);
    });
  });

  describe('on failed submission', () => {
    beforeEach(async () => {
      handleSubmit = sinon.stub().rejects(new Error('Oh no!'));
      wrapper = mount(
        <AddPasswordForm
          handleSubmit={handleSubmit}
        />
      );
      wrapper.setState({
        password: 'mypassword',
        passwordConfirmation: 'mypassword'
      });
      const submitButton = wrapper.find('button');
      submitButton.simulate('click');
      await handleSubmit;
    });

    it('does not reset the password field to its default state', () => {
      const passwordField = wrapper.find('input').at(0);
      expect(passwordField).to.have.value('mypassword');
    });

    it('does not reset the password confirmation field to its default state', () => {
      const passwordConfirmationField = wrapper.find('input').at(1);
      expect(passwordConfirmationField).to.have.value('mypassword');
    });

    it('renders the error state', () => {
      expect(wrapper.find('#uitest-add-password-status')).to.have.text('Oh no!');
    });
  });
});
