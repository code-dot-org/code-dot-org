import {Typography} from '@mui/material';
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
        <Typography component="h1" variant="h3" gutterBottom>
          {title}
        </Typography>
      )}
    </>
  );
};
