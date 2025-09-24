'use client';

import {Box, Button, Stack, Typography} from '@mui/material';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function ActivitiesHero() {
  const pathname = (usePathname() ?? '').toLowerCase();

  // Where the buttons navigate to
  const AI_HREF = '/activities/hour-of-ai';
  const LEGACY_HREF = '/activities/hour-of-code';

  const isAI = /\/hour-of-ai\b|\/ai-activities\b/.test(pathname);
  const isLegacy = /\/hour-of-code\b|\/legacy-hour-of-code\b/.test(pathname);

  const PURPLE = '#2c089f';
  const PURPLE_HOVER = '#24087f';

  const baseBtn = {
    borderRadius: 999,
    px: 3.5,
    height: 56,
    textTransform: 'none' as const,
    fontWeight: 700,
    borderWidth: 2,
  };

  const getSx = (active: boolean) => ({
    ...baseBtn,
    borderColor: PURPLE,
    backgroundColor: active ? PURPLE : 'transparent',
    color: active ? '#fff' : PURPLE,
    '&:hover': {
      borderColor: PURPLE_HOVER,
      backgroundColor: active ? PURPLE_HOVER : 'transparent',
      color: active ? '#fff' : PURPLE_HOVER,
    },
  });

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: {xs: 2, md: 4},
        pt: {xs: 4, md: 8},
        pb: {xs: 2, md: 3},
        textAlign: 'center',
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: {xs: 28, md: 44},
          fontWeight: 800,
          letterSpacing: 0.2,
          mb: 1.5,
        }}
      >
        Legacy Hour of Code Activities
      </Typography>

      <Typography variant="body2" sx={{color: 'text.secondary', mb: 1}}>
        Teachers:{' '}
        <Link href="/hour-of-ai/partners#host-event">Host an hour</Link> or{' '}
        <Link href="/hour-of-ai/how-to/k-12educator">
          read the How-To Guide
        </Link>
      </Typography>

      <Typography
        variant="body2"
        sx={{color: 'text.secondary', maxWidth: 760, mx: 'auto'}}
      >
        The most beloved Hour of Code activities aren’t going anywhere while we
        focus our efforts on expanding high-quality, hands-on AI education.
        Explore legacy Hour of Code activities below.
      </Typography>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{mt: {xs: 2.5, md: 3.5}, flexWrap: 'wrap', rowGap: 1.5}}
      >
        {/* AI Activities */}
        <Button
          component={Link}
          href={AI_HREF}
          variant="outlined"
          aria-current={isAI ? 'page' : undefined}
          aria-pressed={isAI}
          sx={getSx(isAI)}
        >
          AI Activities
        </Button>

        {/* Legacy Hour of Code */}
        <Button
          component={Link}
          href={LEGACY_HREF}
          variant="outlined"
          aria-current={isLegacy ? 'page' : undefined}
          aria-pressed={isLegacy}
          sx={getSx(isLegacy)}
        >
          Legacy Hour of Code Activities
        </Button>
      </Stack>
    </Box>
  );
}
