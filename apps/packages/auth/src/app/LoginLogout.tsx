import {signOut} from 'next-auth/react';
import React from 'react';

import {auth} from '@cdo/app/auth';
import Logout from "@cdo/app/Logout";

export default async function LoginLogout() {
  const session = await auth();
  console.log(session)

  return session?.user != null ? (
    <Logout />
  ) : (
    <div>
      <a href={'/login'}>Login</a>
    </div>
  );
}
