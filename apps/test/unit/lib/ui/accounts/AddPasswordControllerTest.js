import ReactDOM from 'react-dom';
import $ from 'jquery';
import {spy, stub} from 'sinon';
import {expect, assert} from '../../../../util/deprecatedChai';
import AddPasswordController from '@cdo/apps/lib/ui/accounts/AddPasswordController';

describe('AddPasswordController', () => {
  let controller, form, mockMountPoint;

  beforeEach(() => {
    form = $(`
      <form>
        <input type="hidden" id="add-password_user_password"/>
        <input type="hidden" id="add-password_user_password_confirmation"/>
      </form>
    `);
    mockMountPoint = document.createElement('div');
    document.body.appendChild(mockMountPoint);
    controller = new AddPasswordController(form, mockMountPoint);

    spy(ReactDOM, 'render');
  });

  afterEach(() => {
    ReactDOM.render.restore();
    document.body.removeChild(mockMountPoint);
  });

  describe('renderAddPasswordForm', () => {
    it('renders AddPasswordForm', () => {
      expect(ReactDOM.render).not.to.have.been.called;
      controller.renderAddPasswordForm();
      expect(ReactDOM.render).to.have.been.calledOnce;
    });
  });

  describe('submitAddPassword', () => {
    describe('on success', () => {
      beforeEach(() => {
        stub(form, 'submit').callsFake(() => form.trigger('ajax:success'));
      });

      it('sets password field', async () => {
        await controller.submitAddPassword('newpassword', 'newpassword');
        const passwordValue = form.find('#add-password_user_password').val();
        expect(passwordValue).to.equal('newpassword');
      });

      it('sets password confirmation field', async () => {
        await controller.submitAddPassword('otherpassword', 'otherpassword');
        const passwordValue = form
          .find('#add-password_user_password_confirmation')
          .val();
        expect(passwordValue).to.equal('otherpassword');
      });

      it('resolves to undefined', async () => {
        const response = await controller.submitAddPassword(
          'password',
          'password'
        );
        assert.isUndefined(response);
      });
    });

    describe('on failure', () => {
      it('rejects with server error if provided', async () => {
        stub(form, 'submit').callsFake(() =>
          form.trigger('ajax:error', [
            {
              responseJSON: {
                password: ['test-password-error']
              }
            }
          ])
        );
        await expect(
          controller.submitAddPassword('password', 'password')
        ).to.eventually.be.rejectedWith('test-password-error');
      });

      it('rejects with custom error if server error is not provided', async () => {
        stub(form, 'submit').callsFake(() =>
          form.trigger('ajax:error', [
            {
              status: 400
            }
          ])
        );
        await expect(
          controller.submitAddPassword('password', 'password')
        ).to.eventually.be.rejectedWith('Unexpected failure: 400');
      });
    });
  });
});
