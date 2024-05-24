import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography/Typography';

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
