'use client';

import Header from '@/components/header';
import Level from '@/components/level';

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
      <Level levelKey="courseC_maze_programming2_2025" />
    </div>
  );
}
