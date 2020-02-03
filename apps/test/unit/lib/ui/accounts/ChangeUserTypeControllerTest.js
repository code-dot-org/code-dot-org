import ReactDOM from 'react-dom';
import $ from 'jquery';
import {spy, stub} from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import i18n from '@cdo/locale';
import * as utils from '@cdo/apps/utils';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';

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
      expect(button.prop('disabled')).to.be.true;
    });

    it('changing dropdown enables/disables button', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).to.be.false;

      dropdown.val(INITIAL_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).to.be.true;
    });

    it('clicking the enabled button shows a modal dialog', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();

      expect(ReactDOM.render).not.to.have.been.called;
      button.click();
      expect(ReactDOM.render).to.have.been.calledOnce;
    });

    it('show is idempotent', () => {
      expect(ReactDOM.render).not.to.have.been.called;
      controller.showChangeUserTypeModal();
      controller.showChangeUserTypeModal();
      expect(ReactDOM.render).to.have.been.calledOnce;
    });

    it('can hide the modal dialog', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(ReactDOM.render).to.have.been.calledOnce;

      expect(ReactDOM.unmountComponentAtNode).not.to.have.been.called;
      controller.hideChangeUserTypeModal();
      expect(ReactDOM.unmountComponentAtNode).to.have.been.calledOnce;
    });

    it('hide is idempotent', () => {
      controller.showChangeUserTypeModal();

      expect(ReactDOM.unmountComponentAtNode).not.to.have.been.called;
      controller.hideChangeUserTypeModal();
      controller.hideChangeUserTypeModal();
      expect(ReactDOM.unmountComponentAtNode).to.have.been.calledOnce;
    });
  });

  describe('when initialUserType = "teacher"', () => {
    const INITIAL_USER_TYPE = 'teacher';
    const OTHER_USER_TYPE = 'student';

    beforeEach(() => {
      setupWithInitialUserType(INITIAL_USER_TYPE);
    });

    it('button is initially disabled', () => {
      expect(button.prop('disabled')).to.be.true;
    });

    it('changing dropdown enables/disables button', () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).to.be.false;

      dropdown.val(INITIAL_USER_TYPE);
      dropdown.change();
      expect(button.prop('disabled')).to.be.true;
    });

    it('clicking button submits form, reloads page on success', async () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(form.submit).to.have.been.calledOnce;

      expect(dropdown.prop('disabled')).to.be.true;
      expect(button.prop('disabled')).to.be.true;
      expect(status.text()).to.equal(i18n.saving());

      form.trigger('ajax:success');
      await controller.submitPromise;

      expect(utils.reload).to.have.been.calledOnce;
    });

    it('re-enables controls on failure and displays error', async () => {
      dropdown.val(OTHER_USER_TYPE);
      dropdown.change();
      button.click();
      expect(form.submit).to.have.been.calledOnce;

      expect(dropdown.prop('disabled')).to.be.true;
      expect(button.prop('disabled')).to.be.true;
      expect(status.text()).to.equal(i18n.saving());

      form.trigger('ajax:error', [{}]);
      await controller.submitPromise;

      expect(dropdown.prop('disabled')).to.be.false;
      expect(button.prop('disabled')).to.be.false;
      expect(status.text()).to.equal(
        i18n.changeUserTypeModal_unexpectedError()
      );
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
