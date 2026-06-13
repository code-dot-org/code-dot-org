import {Box, Typography} from '@mui/material';
import type {ReactNode} from 'react';

/** A titled Account Details section: a labelled region with its own h2. */
export default function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <Box component="section" aria-labelledby={headingId} sx={{mb: 4}}>
      <Typography variant="h2" component="h2" id={headingId} sx={{mb: 2}}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
