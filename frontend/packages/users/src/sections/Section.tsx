import {Box, Typography, type TypographyProps} from '@mui/material';
import type {ReactNode} from 'react';

export default function Section({
  id,
  title,
  variant = 'h5',
  description,
  children,
}: {
  id: string;
  title: string;
  variant?: TypographyProps['variant'];
  description?: ReactNode;
  children?: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <Box component="section" aria-labelledby={headingId} sx={{mb: 4}}>
      <Typography
        variant={variant}
        component="h2"
        id={headingId}
        sx={{mb: description ? 0 : 2}}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body3" component="p" sx={{mb: 3}}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
