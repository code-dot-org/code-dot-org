import ReactDOM from 'react-dom';
import sinon from 'sinon';
import {expect, assert} from '../../../../util/configuredChai';
import ManageLinkedAccountsController from '@cdo/apps/lib/ui/accounts/ManageLinkedAccountsController';
import * as utils from '@cdo/apps/utils';

const mockAuthenticationOptions = [
  {id: 3, credential_type: 'clever'},
  {id: 1, credential_type: 'google_oauth2'},
  {id: 2, credential_type: 'facebook'},
];
const userHasPassword = true;
const isGoogleClassroomStudent = false;
const isCleverStudent = false;

describe('ManageLinkedAccountsController', () => {
  let controller, mockMountPoint, userType;

  beforeEach(() => {
    mockMountPoint = document.createElement('div');
    document.body.appendChild(mockMountPoint);
    userType = 'teacher';
    const authenticationOptions = [];

    controller = new ManageLinkedAccountsController(
      mockMountPoint,
      userType,
      authenticationOptions,
      userHasPassword,
      isGoogleClassroomStudent,
      isCleverStudent,
    );

    sinon.spy(ReactDOM, 'render');
  });

  afterEach(() => {
    ReactDOM.render.restore();
    document.body.removeChild(mockMountPoint);
  });

  describe('renderManageLinkedAccounts', () => {
    it('renders ManageLinkedAccounts', () => {
      expect(ReactDOM.render).not.to.have.been.called;
      controller.renderManageLinkedAccounts();
      expect(ReactDOM.render).to.have.been.calledOnce;
    });
  });

  describe('connect', () => {
    it('navigates to provider connection endpoint', () => {
      const navigateToHrefStub = sinon.stub(utils, 'navigateToHref');
      controller.connect('google_oauth2');
      let arg = navigateToHrefStub.getCall(0).args[0];
      expect(navigateToHrefStub).to.have.been.calledOnce;
      expect(arg).to.equal('/users/auth/google_oauth2/connect');
    });
  });

  describe('disconnect', () => {
    let server;
    const authOptionToBeDeleted = mockAuthenticationOptions[1];
    const authOptionId = authOptionToBeDeleted.id;

    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    describe('onSuccess', () => {
      beforeEach(() => {
        controller = new ManageLinkedAccountsController(
          mockMountPoint,
          userType,
          mockAuthenticationOptions,
          userHasPassword,
          isGoogleClassroomStudent,
          isCleverStudent,
        );

        server.respondWith(
          'DELETE',
          `/users/auth/${authOptionId}/disconnect`,
          [204, {"Content-Type": "application/json"}, ""]
        );
      });

      it('removes the disconnected authentication option from the list', () => {
        const promise = controller.disconnect(authOptionId);
        server.respond();
        promise.then(() => {
          expect(controller.authenticationOptions).to.not.include(authOptionToBeDeleted);
        });
      });

      it('calls renderManageLinkedAccounts', async () => {
        const renderStub = sinon.stub(controller, 'renderManageLinkedAccounts');

        expect(renderStub).to.not.have.been.called;
        const promise = controller.disconnect(authOptionId);
        server.respond();
        promise.then(() => {
          expect(renderStub).to.have.been.calledOnce;
        });
      });
    });

    describe('onFailure', () => {
      it('rejects with server response text if present', () => {
        server.respondWith(
          'DELETE',
          `/users/auth/${authOptionId}/disconnect`,
          [400, {"Content-Type": "application/json"}, "Oh no!"]
        );
        const promise = controller.disconnect(authOptionId);
        server.respond();
        assert.isRejected(promise, Error, "Oh no!");
      });

      it('rejects with default error if server response not present', () => {
        server.respondWith(
          'DELETE',
          `/users/auth/${authOptionId}/disconnect`,
          [400, {"Content-Type": "application/json"}, ""]
        );
        const promise = controller.disconnect(authOptionId);
        server.respond();
        assert.isRejected(promise, Error, "Unexpected failure: 400");
      });
    });
  });
});
