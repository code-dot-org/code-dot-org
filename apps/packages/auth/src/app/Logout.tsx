'use client';

import {signOut} from 'next-auth/react';
import React from 'react';

export default function Logout() {
  return (
    <div>
      <a style={{color: 'white'}} onClick={() => signOut()}>Logout</a>
    </div>
  );
}
