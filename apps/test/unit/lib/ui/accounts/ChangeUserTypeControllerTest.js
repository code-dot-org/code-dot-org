import $ from 'jquery';
import ReactDOM from 'react-dom';
import {spy, stub} from 'sinon';

import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';



describe('ChangeUserTypeController', () => {
  let controller, form, button, status, dropdown;

  beforeEach(() => {
    stub(utils, 'reload');
    spy(ReactDOM, 'render');
    spy(ReactDOM, 'unmountComponentAtNode');
  });

  afterEach(() => {
    controller && controller.hideChangeUserTypeModal();
    utils.reload.restore();
    ReactDOM.render.restore();
    ReactDOM.unmountComponentAtNode.restore();
  });

  describe('when initialUserType = "student"', () => {
    const INITIAL_USER_TYPE = 'student';
    const OTHER_USER_TYPE = 'teacher';

    beforeEach(() => {
      setupWithInitialUserType(INITIAL_USER_TYPE);
    });

    it('button is initially disabled', () => {
      expect(button.prop('disabled')).toBe(true);
    });

    it('changing dropdown enables/disables button', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).toBe(false);

      dropdown.val(INITIAL_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).toBe(true);
    });

    it('clicking the enabled button shows a modal dialog', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();

      expect(ReactDOM.render).not.toHaveBeenCalled();
      button.click();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('show is idempotent', () => {
      expect(ReactDOM.render).not.toHaveBeenCalled();
      controller.showChangeUserTypeModal();
      controller.showChangeUserTypeModal();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    });

    it('can hide the modal dialog', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(ReactDOM.render).toHaveBeenCalledTimes(1);

      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideChangeUserTypeModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });

    it('hide is idempotent', () => {
      controller.showChangeUserTypeModal();

      expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
      controller.hideChangeUserTypeModal();
      controller.hideChangeUserTypeModal();
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledTimes(1);
    });
  });

  describe('when initialUserType = "teacher"', () => {
    const INITIAL_USER_TYPE = 'teacher';
    const OTHER_USER_TYPE = 'student';

    beforeEach(() => {
      setupWithInitialUserType(INITIAL_USER_TYPE);
    });

    it('button is initially disabled', () => {
      expect(button.prop('disabled')).toBe(true);
    });

    it('changing dropdown enables/disables button', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).toBe(false);

      dropdown.val(INITIAL_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).toBe(true);
    });

    it('clicking button submits form, reloads page on success', async () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(form.submit).toHaveBeenCalledTimes(1);

      expect(dropdown.prop('disabled')).toBe(true);
      expect(button.prop('disabled')).toBe(true);
      expect(status.text()).toBe(i18n.saving());

      form.trigger('ajax:success');
      await controller.submitPromise;

      expect(utils.reload).toHaveBeenCalledTimes(1);
    });

    it('re-enables controls on failure and displays error', async () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(form.submit).toHaveBeenCalledTimes(1);

      expect(dropdown.prop('disabled')).toBe(true);
      expect(button.prop('disabled')).toBe(true);
      expect(status.text()).toBe(i18n.saving());

      form.trigger('ajax:error', [{}]);
      await controller.submitPromise;

      expect(dropdown.prop('disabled')).toBe(false);
      expect(button.prop('disabled')).toBe(false);
      expect(status.text()).toBe(i18n.changeUserTypeModal_unexpectedError());
    });
  });

  function setupWithInitialUserType(userType) {
    form = $(`
      <form>
        <input type="hidden" id="change-user-type_user_email"/>
        <input type="hidden" id="change-user-type_user_email_preference_opt_in"/>
        <select id="change-user-type_user_user_type">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <span id="change-user-type-status"/>
        <button id="change-user-type-button"/>
      </form>
    `);
    stub(form, 'submit');

    dropdown = form.find('#change-user-type_user_user_type');
    dropdown.val(userType);

    button = form.find('#change-user-type-button');

    status = form.find('#change-user-type-status');

    controller = new ChangeUserTypeController(form, userType);
  }
});
