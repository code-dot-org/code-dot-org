import { assert } from 'chai';
import cookies from 'js-cookie';
import { getUserSignedInFromCookieAndDom } from '@cdo/apps/code-studio/initSigninState';
import { allowConsoleErrors } from '../../util/testUtils';

describe('initSigninStateTest', () => {
  describe('getUserSignedInFromCookieAndDom', () => {
    allowConsoleErrors();
    let headerDiv;
    let stashedCookieKey;

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

    const cookieName = '__testcookie__';
    beforeEach(() => {
      cookies.remove(cookieName);
      stashedCookieKey = window.userNameCookieKey;
      delete window.userNameCookieKey;
    });

    afterEach(() => {
      if (headerDiv) {
        document.body.removeChild(headerDiv);
        headerDiv = null;
      }
      window.userNameCookieKey = stashedCookieKey;
    });

    it('does not work if userNameCookieKey is not set', () => {
      assert.strictEqual(getUserSignedInFromCookieAndDom(), undefined);
    });

    it('returns true if cookie is defined', () => {
      window.userNameCookieKey = cookieName;
      cookies.set(cookieName, 'CoolUser');
      assert.strictEqual(getUserSignedInFromCookieAndDom(), true);
    });

    it('returns true if cookie is not defined but DOM contains id', () => {
      window.userNameCookieKey = cookieName;

      // Make sure this DOM didn't leak in from some other test
      assert.equal(document.querySelector('.header_button.header_user.user_menu .user_name'), null);

      createHeaderDom(123);
      assert.strictEqual(getUserSignedInFromCookieAndDom(), true);
    });

    it('returns false if cookie is not defined and DOM does not contain id', () => {
      window.userNameCookieKey = cookieName;

      // Make sure this DOM didn't leak in from some other test
      assert.equal(document.querySelector('.header_button.header_user.user_menu .user_name'), null);

      createHeaderDom();
      assert.strictEqual(getUserSignedInFromCookieAndDom(), false);
    });
  });
});
