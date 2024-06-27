import {redirect} from 'next/navigation';
import React from 'react';

import {signIn} from '@cdo/app/auth';

export default async function Page() {
  return (
    <form
      action={async (formData: FormData) => {
        'use server';
        const object = {redirectTo: '/sections'};
        formData.forEach((value, key) => (object[key] = value));

        await signIn('credentials', object);
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
