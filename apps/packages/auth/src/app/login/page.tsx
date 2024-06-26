'use client';
import React from 'react';
import {useFormState, useFormStatus} from 'react-dom';

import {authenticate} from '@cdo/app/lib/actions';

export default function Page() {
  const [errorMessage, dispatch] = useFormState(() => {
    webAuth.login();
  }, undefined);

  return (
    <form action={dispatch}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <div>{errorMessage && <p>{errorMessage}</p>}</div>
      <LoginButton />
    </form>
  );
}

function LoginButton() {
  const {pending} = useFormStatus();

  const handleClick = (event: React.MouseEvent) => {
    if (pending) {
      event.preventDefault();
    }
  };

  return (
    <button aria-disabled={pending} type="submit" onClick={handleClick}>
      Login
    </button>
  );
}
