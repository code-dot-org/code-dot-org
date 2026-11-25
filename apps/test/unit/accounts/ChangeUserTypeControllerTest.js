import $ from 'jquery';
import {spy, stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import ChangeUserTypeController from '@cdo/apps/accounts/ChangeUserTypeController';
import * as createReactRootModule from '@cdo/apps/util/createReactRoot';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ChangeUserTypeController', () => {
  let controller, form;

  beforeEach(() => {
    stub(utils, 'reload');
    spy(createReactRootModule, 'createReactRoot');
    spy(createReactRootModule, 'unmountReactRoot');
  });

  afterEach(() => {
    controller && controller.hideChangeUserTypeModal();
    utils.reload.restore();
    createReactRootModule.createReactRoot.restore();
    createReactRootModule.unmountReactRoot.restore();
  });

  function setupWithInitialUserType(userType) {
    form = $(`
      <form>
        <input type="hidden" id="change-user-type_user_email"/>
        <input type="hidden" id="change-user-type_user_email_preference_opt_in"/>
        <input type="hidden" id="change-user-type_user_user_type"/>
      </form>
    `);
    stub(form, 'submit');
    controller = new ChangeUserTypeController(form, userType);
  }

  describe('handling user_return_to param', () => {
    const windowLocation = window.location;

    beforeEach(() => {
      delete window.location;
      window.location = {
        href: '',
        search: '',
      };
      setupWithInitialUserType('student');
    });

    afterEach(() => {
      window.location = windowLocation;
    });

    it('navigates to the user_return_to URL if the param exists', async () => {
      const userReturnToUrl = '/return-path';
      window.location.search = `?user_return_to=${encodeURIComponent(
        userReturnToUrl
      )}`;

      const submitPromise = controller.submitUserTypeChange({
        email: 'test@example.com',
        emailOptIn: true,
      });
      form.trigger('ajax:success');
      await submitPromise;

      expect(window.location.href).to.equal(userReturnToUrl);
    });

    it('resolves normally if the user_return_to param is not relative', async () => {
      const userReturnToUrl = 'http://return-path';
      window.location.search = `?user_return_to=${encodeURIComponent(
        userReturnToUrl
      )}`;

      const submitPromise = controller.submitUserTypeChange({
        email: 'test@example.com',
        emailOptIn: true,
      });
      form.trigger('ajax:success');
      await submitPromise;

      expect(window.location.href).to.equal('');
    });

    it('resolves normally if the user_return_to param does not exist', async () => {
      const submitPromise = controller.submitUserTypeChange({
        email: 'test@example.com',
        emailOptIn: true,
      });
      form.trigger('ajax:success');
      await submitPromise;

      expect(window.location.href).to.equal('');
    });
  });

  describe('handleConfirm', () => {
    beforeEach(() => setupWithInitialUserType('student'));

    it('sets the hidden user_type field', () => {
      controller.handleConfirm('teacher');
      expect(form.find('#change-user-type_user_user_type').val()).to.equal(
        'teacher'
      );
    });

    it('opens the email-confirmation modal when changing to teacher', () => {
      expect(createReactRootModule.createReactRoot).not.to.have.been.called;
      const result = controller.handleConfirm('teacher');
      expect(createReactRootModule.createReactRoot).to.have.been.calledOnce;
      expect(result).to.be.undefined;
    });

    it('submits the form directly when changing to student', () => {
      const result = controller.handleConfirm('student');
      expect(form.submit).to.have.been.calledOnce;
      expect(createReactRootModule.createReactRoot).not.to.have.been.called;
      expect(result).to.be.an.instanceof(Promise);
    });
  });

  describe('modal show/hide', () => {
    beforeEach(() => setupWithInitialUserType('student'));

    it('show is idempotent', () => {
      expect(createReactRootModule.createReactRoot).not.to.have.been.called;
      controller.showChangeUserTypeModal();
      controller.showChangeUserTypeModal();
      expect(createReactRootModule.createReactRoot).to.have.been.calledOnce;
    });

    it('can hide the modal dialog', () => {
      controller.showChangeUserTypeModal();
      expect(createReactRootModule.createReactRoot).to.have.been.calledOnce;

      expect(createReactRootModule.unmountReactRoot).not.to.have.been.called;
      controller.hideChangeUserTypeModal();
      expect(createReactRootModule.unmountReactRoot).to.have.been.calledOnce;
    });

    it('hide is idempotent', () => {
      controller.showChangeUserTypeModal();

      expect(createReactRootModule.unmountReactRoot).not.to.have.been.called;
      controller.hideChangeUserTypeModal();
      controller.hideChangeUserTypeModal();
      expect(createReactRootModule.unmountReactRoot).to.have.been.calledOnce;
    });
  });
});
