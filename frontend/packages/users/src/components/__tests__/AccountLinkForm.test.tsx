import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {setSpaCsrfToken} from '@code-dot-org/core/api';

import AccountLinkForm from '../AccountLinkForm';

afterEach(() => setSpaCsrfToken(null));

describe('AccountLinkForm', () => {
  it('posts the CSRF token current at submit, not the one at render', () => {
    setSpaCsrfToken('token-at-render');
    render(
      <AccountLinkForm action="/users/auth/google_oauth2?action=connect">
        <button type="submit">Connect</button>
      </AccountLinkForm>,
    );
    setSpaCsrfToken('token-at-submit');

    const form = screen.getByRole('button', {name: 'Connect'}).closest('form')!;
    fireEvent.submit(form);

    expect(form).toHaveFormValues({authenticity_token: 'token-at-submit'});
  });
});
