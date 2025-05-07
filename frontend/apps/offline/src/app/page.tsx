'use client';

import Header from '@/components/header';

export default function Page() {
  return (
    <div
      id="root"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header />
    </div>
  );
}
