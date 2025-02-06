import Typography from '@code-dot-org/component-library/typography';
import React from 'react';

interface CardHeaderProps {
  title?: string;
  icon?: React.ReactNode;
}
export const CardHeader = ({icon, title}: CardHeaderProps) => {
  return (
    <>
      {icon}

      {title && (
        <Typography semanticTag={'h1'} visualAppearance={'heading-lg'}>
          {title}
        </Typography>
      )}
    </>
  );
};
