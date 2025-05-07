'use client';

import {useContext} from 'react';

import Header from '@/components/header';
import Unit from '@/components/unit';
import UnitContext from '@/contexts/UnitContext';

export default function UnitViewPage() {
  const {unit} = useContext(UnitContext);

  return (
    <div
      id="root"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Header />
      <Unit unitKey={unit.key} unit={unit} />
    </div>
  );
}
