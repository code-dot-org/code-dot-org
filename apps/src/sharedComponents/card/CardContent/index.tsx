import React, {ReactNode} from 'react';

interface CardContentProps {
  children: ReactNode;
  className?: string;
}
export const CardContent = ({className, children}: CardContentProps) => {
  return <div className={className}>{children}</div>;
};
