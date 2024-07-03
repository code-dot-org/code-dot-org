import $ from 'jquery';
import ReactDOM from 'react-dom';
import {spy, stub} from 'sinon';

import {hashEmail} from '@cdo/apps/code-studio/hashEmail';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import color from '@cdo/apps/util/color';



export const ENCRYPTED_EMAIL_PLACEHOLDER = '***encrypted***';

describe('ChangeEmailController', () => {
  let controller, form, link, displayedUserEmail, emailChangedCallback;

  const TEST_EMAIL = 'batman@bat.cave';
  const TEST_PASSWORD = 'test-password';

  beforeEach(() => {
    form = $(`
      <form>
        <input type="hidden" id="change-email-modal_user_email"/>
        <input type="hidden" id="change-email-modal_user_hashed_email"/>
        <input type="hidden" id="change-email-modal_user_email_preference_opt_in"/>
        <input type="hidden" id="change-email-modal_user_current_password"/>
      </form>
    `);

    link = $('<a/>');

    displayedUserEmail = $('<span/>');
    displayedUserEmail.effect = spy();

    emailChangedCallback = spy();
  });

  function newController(userAge, userType) {
    return new ChangeEmailController({
      form,
      link,
      displayedUserEmail,
      userAge,
      userType,
      isPasswordRequired: true,
      emailChangedCallback,
    });
  }

  describe('controls ChangeEmailModal', () => {
    beforeEach(() => {
      controller = newController(12, 'student');
      spy(ReactDOM, 'render');
      spy(ReactDOM, 'unmountComponentAtNode');
    });

    afterEach(() => {
      controller.hideChangeEmailModal();
      ReactDOM.render.restore();
      ReactDOM.unmountComponentAtNode.restore();
    });

    it('shows on showChangeEmailModal', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      controller.showChangeEmailModal();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('show is idempotent', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      controller.showChangeEmailModal();
      controller.showChangeEmailModal();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('shows when the #edit-email-link is clicked', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      link.click();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('hides on hideChangeEmailModal', () => {
      controller.showChangeEmailModal();
      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideChangeEmailModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });

    it('hide is idempotent', () => {
      controller.showChangeEmailModal();
      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideChangeEmailModal();
      controller.hideChangeEmailModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitEmailChange', () => {
    beforeEach(() => {
      controller = newController(21, 'teacher');
      stub(form, 'submit').callsFake(() => form.trigger('ajax:success'));
    });

    it('sets email field if user is 13 or older', async () => {
      controller = newController(13, 'student');
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
      });
      expect(form.find('#change-email-modal_user_email').val()).toBe(TEST_EMAIL);
    });

    it('clears email field if user is under 13', async () => {
      controller = newController(12, 'student');
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
      });
      expect(form.find('#change-email-modal_user_email').val()).toBe('');
    });

    it('sets hashed email field', async () => {
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
      });
      expect(form.find('#change-email-modal_user_hashed_email').val()).toBe(hashEmail(TEST_EMAIL));
    });

    it('sets email_preference_opt_in if "yes"', async () => {
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
        emailOptIn: 'yes',
      });
      expect(
        form.find('#change-email-modal_user_email_preference_opt_in').val()
      ).toBe('yes');
    });

    it('sets email_preference_opt_in if "no"', async () => {
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
        emailOptIn: 'no',
      });
      expect(
        form.find('#change-email-modal_user_email_preference_opt_in').val()
      ).toBe('no');
    });

    it('does not set email_preference_opt_in otherwise', async () => {
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
        emailOptIn: undefined,
      });
      expect(
        form.find('#change-email-modal_user_email_preference_opt_in').val()
      ).toBe('');
    });

    it('sets current password field', async () => {
      await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
      });
      expect(
        form.find('#change-email-modal_user_current_password').val()
      ).toBe(TEST_PASSWORD);
    });

    it('resolves to new email on success', async () => {
      const newEmail = await controller.submitEmailChange({
        newEmail: TEST_EMAIL,
        currentPassword: TEST_PASSWORD,
      });
      expect(newEmail).toBe(TEST_EMAIL);
    });

    it('rejects on failure', async () => {
      // Simulate failure
      form.submit.callsFake(() => form.trigger('ajax:error', [{}]));
      await expect(
        controller.submitEmailChange({
          newEmail: TEST_EMAIL,
          currentPassword: TEST_PASSWORD,
        })
      ).to.eventually.be.rejectedWith(Error);
    });

    it('rejects with server errors when they are returned', async () => {
      // Simulate failure with server-provided validation errors
      form.submit.callsFake(() =>
        form.trigger('ajax:error', [
          {
            responseJSON: {
              email: ['test-email-error'],
              current_password: ['test-current-password-error'],
            },
          },
        ])
      );
      await expect(
        controller.submitEmailChange({
          newEmail: TEST_EMAIL,
          currentPassword: TEST_PASSWORD,
        })
      ).to.eventually.be.rejectedWith({
        serverErrors: {
          email: 'test-email-error',
          currentPassword: 'test-current-password-error',
        },
      });
    });
  });

  describe('onEmailChanged', () => {
    it('updates the displayed user email for a teacher', () => {
      controller = newController(21, 'teacher');
      controller.onEmailChanged(TEST_EMAIL);
      expect(displayedUserEmail.text()).toBe(TEST_EMAIL);
    });

    it('does not update the displayed user email for a student', () => {
      controller = newController(21, 'student');
      displayedUserEmail.text(ENCRYPTED_EMAIL_PLACEHOLDER);
      controller.onEmailChanged(TEST_EMAIL);
      expect(displayedUserEmail.text()).toBe(ENCRYPTED_EMAIL_PLACEHOLDER);
    });

    it('causes a highlight effect on the displayed user email', () => {
      controller = newController(21, 'student');
      expect(displayedUserEmail.effect).not.toHaveBeenCalled();
      controller.onEmailChanged(TEST_EMAIL);
      expect(displayedUserEmail.effect).toHaveBeenCalledWith('highlight', {
        duration: 1500,
        color: color.orange,
      });
    });

    it('calls the emailChangeCallback with new email and hashed email', () => {
      controller = newController(21, 'student');
      expect(emailChangedCallback).not.toHaveBeenCalled();
      controller.onEmailChanged(TEST_EMAIL);
      expect(emailChangedCallback).toHaveBeenCalledWith(TEST_EMAIL, hashEmail(TEST_EMAIL));
    });
  });
});
