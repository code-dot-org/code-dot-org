import sinon from 'sinon';
import {assert, expect} from '../../../../util/configuredChai';
import manageLinkedAccounts, {
  initialState,
  initializeState,
  removeAuthOption,
  setAuthOptionError,
  convertServerAuthOptions,
  disconnectOnServer,
} from '@cdo/apps/lib/ui/accounts/manageLinkedAccountsRedux';

describe('manageLinkedAccountsRedux', () => {
  let server;

  beforeEach(() => {
    server = sinon.fakeServer.create();
  });

  afterEach(() => server.restore());

  describe('initializeState', () => {
    it('sets state from action state', () => {
      const authenticationOptions = {
        1: {id: 1, credentialType: 'google_oauth2', email: 'example@email.com'},
        2: {id: 2, credentialType: 'facebook', email: 'another@email.com'},
      };
      const state = {
        authenticationOptions: authenticationOptions,
        userHasPassword: true,
        isGoogleClassroomStudent: true,
        isCleverStudent: true
      };
      const initializeStateAction = initializeState(state);
      const newState = manageLinkedAccounts(null, initializeStateAction);
      assert.deepEqual(newState.authenticationOptions, authenticationOptions);
      assert(newState.userHasPassword);
      assert(newState.isGoogleClassroomStudent);
      assert(newState.isCleverStudent);
    });
  });

  describe('removeAuthOption', () => {
    it('removes the authentication option by id', () => {
      const initialState = {
        ...initialState,
        authenticationOptions: {
          1: {id: 1, credentialType: 'google_oauth2', email: 'example@email.com'}
        }
      };
      const removeAuthOptionAction = removeAuthOption(1);
      const newState = manageLinkedAccounts(initialState, removeAuthOptionAction);
      assert.deepEqual(newState.authenticationOptions, {});
    });

    it('throws an error if the authentication option doesn\'t exist', () => {
      const removeAuthOptionAction = removeAuthOption(1);
      const fn = () => {manageLinkedAccounts(initialState, removeAuthOptionAction);};
      assert.throws(fn, Error, 'Authentication option with id 1 does not exist');
    });
  });

  describe('setAuthOptionError', () => {
    it('sets an error on authentication option by id', () => {
      const initialState = {
        ...initialState,
        authenticationOptions: {
          1: {id: 1, credentialType: 'google_oauth2', email: 'example@email.com', error: ''}
        }
      };
      const expectedError = 'Oh no!';
      const setAuthOptionErrorAction = setAuthOptionError(1, expectedError);
      const newState = manageLinkedAccounts(initialState, setAuthOptionErrorAction);
      assert.deepEqual(newState.authenticationOptions[1].error, expectedError);
    });

    it('throws an error if the authentication option doesn\'t exist', () => {
      const setAuthOptionErrorAction = setAuthOptionError(1);
      const fn = () => {manageLinkedAccounts(initialState, setAuthOptionErrorAction);};
      assert.throws(fn, Error, 'Authentication option with id 1 does not exist');
    });
  });

  describe('convertServerAuthOptions', () => {
    it('maps authentication options from server by id', () => {
      const authenticationOptions = [
        {id: 1, credential_type: 'facebook', email: 'example@email.com'}
      ];
      const expectedAuthOptions = {
        1: {id: 1, credentialType: 'facebook', email: 'example@email.com', error: ''}
      };
      const convertedAuthOptions = convertServerAuthOptions(authenticationOptions);
      assert.deepEqual(convertedAuthOptions, expectedAuthOptions);
    });
  });

  describe('disconnectOnServer', () => {
    it('calls onComplete with null on success', () => {
      const authOptionId = 1;
      const onComplete = sinon.spy();
      server.respondWith(
        'DELETE',
        `/users/auth/${authOptionId}/disconnect`,
        [204, {"Content-Type": "application/json"}, ""]
      );
      disconnectOnServer(authOptionId, onComplete);
      server.respond();
      expect(onComplete).to.have.been.calledOnce;
      const arg = onComplete.getCall(0).args[0];
      assert.isNull(arg);
    });

    it('calls onComplete with server responseText if provided on failure', () => {
      const authOptionId = 1;
      const onComplete = sinon.spy();
      server.respondWith(
        'DELETE',
        `/users/auth/${authOptionId}/disconnect`,
        [400, {"Content-Type": "application/json"}, "Oh no!"]
      );
      disconnectOnServer(authOptionId, onComplete);
      server.respond();
      expect(onComplete).to.have.been.calledOnce;
      const arg = onComplete.getCall(0).args[0];
      assert.deepEqual(arg, 'Oh no!');
    });

    it('calls onComplete with status error if no server responseText provided on failure', () => {
      const authOptionId = 1;
      const onComplete = sinon.spy();
      server.respondWith(
        'DELETE',
        `/users/auth/${authOptionId}/disconnect`,
        [400, {"Content-Type": "application/json"}, ""]
      );
      disconnectOnServer(authOptionId, onComplete);
      server.respond();
      expect(onComplete).to.have.been.calledOnce;
      const arg = onComplete.getCall(0).args[0];
      assert.deepEqual(arg, 'Unexpected failure: 400');
    });
  });
});
