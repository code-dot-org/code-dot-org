import { assert } from 'chai';
import cookies from 'js-cookie';
import { getUserSignedInFromCookieAndDom } from '@cdo/apps/code-studio/initSigninState';
import { allowConsoleErrors } from '../../util/testUtils';
import { environmentSpecificCookieName } from '@cdo/apps/code-studio/utils';

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
      name.setAttribute('class', 'user_name');
      if (dataId) {
        name.setAttribute('data-id', dataId);
      }
      headerDiv.appendChild(name);
    }

    before(() => {
      stashedRackEnv = window.dashboard.rack_env;
      window.dashboard.rack_env = 'unit_test';
      cookieName = environmentSpecificCookieName('_shortName');
    });
    after(() => {
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
      assert.strictEqual(getUserSignedInFromCookieAndDom(), true);
    });

    it('returns true if cookie is not defined but DOM contains id', () => {
      // Make sure this DOM didn't leak in from some other test
      assert.equal(document.querySelector('.header_button.header_user.user_menu .user_name'), null);

      createHeaderDom(123);
      assert.strictEqual(getUserSignedInFromCookieAndDom(), true);
    });

    it('returns false if cookie is not defined and DOM does not contain id', () => {
      // Make sure this DOM didn't leak in from some other test
      assert.equal(document.querySelector('.header_button.header_user.user_menu .user_name'), null);

      createHeaderDom();
      assert.strictEqual(getUserSignedInFromCookieAndDom(), false);
    });
  });
});
