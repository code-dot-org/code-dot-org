import $ from 'jquery';
import cookies from 'js-cookie';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import {
  setUserSignedIn,
  setUserType,
} from '@cdo/apps/templates/currentUserRedux';
import SignInOrAgeDialog from '@cdo/apps/templates/SignInOrAgeDialog';

import {getStore} from './redux';

/**
 * Attempt to replicate logic used that user_header.haml uses to populate the
 * name in our Sign In button.
 * @returns {boolean}
 */
export function getUserSignedInFromCookieAndDom() {
  const val = cookies.get(environmentSpecificCookieName('_shortName'));
  if (val) {
    return true;
  } else {
    // We did not have a cookie, meaning we're probably not signed in. Because
    // we want to replicate the logic in user_header.haml, also check to see if
    // the server had populated our DOM with a user id.
    const displayNameSpan = document.querySelector(
      '.header_button.header_user.user_menu .display_name'
    );
    return !!(displayNameSpan && displayNameSpan.dataset.id);
  }
}

/**
 * Determines signin state and dispatches to the store. Shows a dialog asking
 * the user for their age or to sign in if necessary.
 */
export default function initSigninState(userType, under13) {
  $(document).ready(() => {
    const store = getStore();
    store.dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

    if (userType) {
      store.dispatch(setUserType(userType, under13));
    }

    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <SignInOrAgeDialog />
      </Provider>,
      div
    );
    document.body.appendChild(div);
  });
}
