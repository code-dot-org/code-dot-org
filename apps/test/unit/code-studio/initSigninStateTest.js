import cookies from 'js-cookie'; // eslint-disable-line no-restricted-imports

import {getUserSignedInFromCookieAndDom} from '@cdo/apps/code-studio/initSigninState';
import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';

import {allowConsoleErrors, setExternalGlobals} from '../../util/testUtils';

setExternalGlobals();
describe('initSigninStateTest', () => {
  describe('getUserSignedInFromCookieAndDom', () => {
    allowConsoleErrors();
    let headerDiv;
    let cookieName;
    let stashedRackEnv;

    function createHeaderDom(dataId) {
      headerDiv = document.createElement('div');
      headerDiv.setAttribute('class', 'header_button header_user user_menu');
      document.body.appendChild(headerDiv);

      const name = document.createElement('div');
      name.setAttribute('class', 'display_name');
      if (dataId) {
        name.setAttribute('data-id', dataId);
      }
      headerDiv.appendChild(name);
    }

    beforeAll(() => {
      stashedRackEnv = window.dashboard.rack_env;
      window.dashboard.rack_env = 'unit_test';
      cookieName = environmentSpecificCookieName('_shortName');
    });
    afterAll(() => {
      window.dashboard.rack_env = stashedRackEnv;
    });

    beforeEach(() => {
      cookies.remove(cookieName);
    });

    afterEach(() => {
      if (headerDiv) {
        document.body.removeChild(headerDiv);
        headerDiv = null;
      }
    });

    it('returns true if cookie is defined', () => {
      cookies.set(cookieName, 'CoolUser');
      expect(getUserSignedInFromCookieAndDom()).toBe(true);
    });

    it('returns true if cookie is not defined but DOM contains id', () => {
      // Make sure this DOM didn't leak in from some other test
      expect(
        document.querySelector(
          '.header_button.header_user.user_menu .display_name'
        )
      ).toEqual(null);

      createHeaderDom(123);
      expect(getUserSignedInFromCookieAndDom()).toBe(true);
    });

    it('returns false if cookie is not defined and DOM does not contain id', () => {
      // Make sure this DOM didn't leak in from some other test
      expect(
        document.querySelector(
          '.header_button.header_user.user_menu .display_name'
        )
      ).toEqual(null);

      createHeaderDom();
      expect(getUserSignedInFromCookieAndDom()).toBe(false);
    });
  });
});
