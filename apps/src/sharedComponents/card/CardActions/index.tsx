import React, {ReactNode} from 'react';

interface CardContentProps {
  children: ReactNode;
}
export const CardActions = ({children}: CardContentProps) => {
  return <div>{children}</div>;
};
