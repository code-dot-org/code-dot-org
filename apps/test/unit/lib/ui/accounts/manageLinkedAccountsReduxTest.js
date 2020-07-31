import sinon from 'sinon';
import {assert} from '../../../../util/deprecatedChai';
import manageLinkedAccounts, {
  initializeState,
  convertServerAuthOptions
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
        2: {id: 2, credentialType: 'facebook', email: 'another@email.com'}
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

  describe('convertServerAuthOptions', () => {
    it('maps authentication options from server by id', () => {
      const authenticationOptions = [
        {id: 1, credential_type: 'facebook', email: 'example@email.com'}
      ];
      const expectedAuthOptions = {
        1: {
          id: 1,
          credentialType: 'facebook',
          email: 'example@email.com',
          error: ''
        }
      };
      const convertedAuthOptions = convertServerAuthOptions(
        authenticationOptions
      );
      assert.deepEqual(convertedAuthOptions, expectedAuthOptions);
    });
  });
});
