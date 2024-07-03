import $ from 'jquery';
import ReactDOM from 'react-dom';
import {spy, stub} from 'sinon';

import AddParentEmailController from '@cdo/apps/lib/ui/accounts/AddParentEmailController';



export const ENCRYPTED_EMAIL_PLACEHOLDER = '***encrypted***';

describe('AddParentEmailController', () => {
  let controller,
    form,
    parentEmailField,
    parentOptInField,
    link,
    onSuccessCallback;

  const TEST_EMAIL = 'batman@bat.cave';

  beforeEach(() => {
    form = $(`
      <form>
        <input type="hidden" id="add-parent-email-modal_user_parent_email"/>
        <input type="hidden" id="add-parent-email-modal_user_parent_email_preference_opt_in"/>
      </form>
    `);
    parentEmailField = form.find('#add-parent-email-modal_user_parent_email');
    parentOptInField = form.find(
      '#add-parent-email-modal_user_parent_email_preference_opt_in'
    );

    link = $('<a/>');

    onSuccessCallback = spy();
  });

  function newController() {
    return new AddParentEmailController({
      form,
      formParentEmailField: parentEmailField,
      formParentOptInField: parentOptInField,
      link,
      onSuccessCallback,
    });
  }

  describe('controls AddParentEmailModal', () => {
    beforeEach(() => {
      controller = newController();
      spy(ReactDOM, 'render');
      spy(ReactDOM, 'unmountComponentAtNode');
    });

    afterEach(() => {
      controller.hideAddParentEmailModal();
      ReactDOM.render.restore();
      ReactDOM.unmountComponentAtNode.restore();
    });

    it('shows on showAddParentEmailModal', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      controller.showAddParentEmailModal();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('show is idempotent', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      controller.showAddParentEmailModal();
      controller.showAddParentEmailModal();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('shows when the link is clicked', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      link.click();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('hides on hideAddParentEmailModal', () => {
      controller.showAddParentEmailModal();
      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideAddParentEmailModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });

    it('hide is idempotent', () => {
      controller.showAddParentEmailModal();
      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideAddParentEmailModal();
      controller.hideAddParentEmailModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitParentEmailChange', () => {
    beforeEach(() => {
      controller = newController();
      stub(form, 'submit').callsFake(() => form.trigger('ajax:success'));
    });

    it('sets parent email field', async () => {
      await controller.submitParentEmailChange({
        parentEmail: TEST_EMAIL,
        parentEmailOptIn: 'yes',
      });
      expect(
        form.find('#add-parent-email-modal_user_parent_email').val()
      ).toBe(TEST_EMAIL);
    });

    it('sets email_preference_opt_in if "yes"', async () => {
      await controller.submitParentEmailChange({
        parentEmail: TEST_EMAIL,
        parentEmailOptIn: 'yes',
      });
      expect(
        form
          .find('#add-parent-email-modal_user_parent_email_preference_opt_in')
          .val()
      ).toBe('yes');
    });

    it('sets email_preference_opt_in if "no"', async () => {
      await controller.submitParentEmailChange({
        parentEmail: TEST_EMAIL,
        parentEmailOptIn: 'no',
      });
      expect(
        form
          .find('#add-parent-email-modal_user_parent_email_preference_opt_in')
          .val()
      ).toBe('no');
    });

    it('does not set email_preference_opt_in otherwise', async () => {
      await controller.submitParentEmailChange({
        parentEmail: TEST_EMAIL,
        parentEmailOptIn: undefined,
      });
      expect(
        form
          .find('#add-parent-email-modal_user_parent_email_preference_opt_in')
          .val()
      ).toBe('');
    });

    it('resolves to new email on success', async () => {
      const parentEmail = await controller.submitParentEmailChange({
        parentEmail: TEST_EMAIL,
        parentEmailOptIn: 'yes',
      });
      expect(parentEmail).toBe(TEST_EMAIL);
    });

    it('rejects on failure', async () => {
      // Simulate failure
      form.submit.callsFake(() => form.trigger('ajax:error', [{}]));
      await expect(
        controller.submitParentEmailChange({
          parentEmail: TEST_EMAIL,
          parentEmailOptIn: 'yes',
        })
      ).to.eventually.be.rejectedWith(Error);
    });

    it('rejects with server errors when they are returned', async () => {
      // Simulate failure with server-provided validation errors
      form.submit.callsFake(() =>
        form.trigger('ajax:error', [
          {
            responseJSON: {
              parentEmail: ['test-email-error'],
            },
          },
        ])
      );
      await expect(
        controller.submitParentEmailChange({
          parentEmail: TEST_EMAIL,
          parentEmailOptIn: 'yes',
        })
      ).to.eventually.be.rejectedWith({
        serverErrors: {
          parentEmail: 'test-email-error',
        },
      });
    });
  });

  describe('onParentEmailChanged', () => {
    it('calls the onSuccessCallback on success', () => {
      controller = newController();
      controller.onParentEmailChanged(TEST_EMAIL);
      expect(onSuccessCallback).toHaveBeenCalledTimes(1);
    });
  });
});
