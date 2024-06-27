import React from 'react';

import {signIn} from '@cdo/app/auth';

export default async function Page() {
  return (
    <form
      action={async (formData: FormData) => {
        'use server';
        await signIn('credentials', formData);
      }}
    >
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <LoginButton />
    </form>
  );
}

function LoginButton() {
  return <button type="submit">Login</button>;
}
