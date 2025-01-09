// This is a stub component to make the package buildable during the setup phase
// This stub component is to be removed once an actual component is implemented.

import React from 'react';

export interface StubProps {
  backgroundColor: 'black' | 'white' | 'red';
  label: string;
  onClick?: () => void;
}

export const Stub: React.FC<StubProps> = ({
  backgroundColor,
  onClick,
  label,
}: StubProps) => {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <button style={{backgroundColor}} onClick={handleClick}>
      {label}
    </button>
  );
};
