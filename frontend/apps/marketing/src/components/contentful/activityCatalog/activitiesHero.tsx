'use client';

import {Box, Button, Stack, Typography} from '@mui/material';
import Link from 'next/link';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

interface ActivitiesHeroProps {
  activityType: ActivityType;
}

export default function ActivitiesHero({activityType}: ActivitiesHeroProps) {
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
        {activityType === ActivityType.HOUR_OF_CODE
          ? 'Hour of Code Activities'
          : 'Hour of AI Activities'}
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
        <Button
          component={Link}
          href={`/activities/hour-of-ai`}
          variant={activityType === 'hour-of-code' ? 'contained' : 'outlined'}
          color={'primary'}
        >
          AI Activities
        </Button>

        <Button
          component={Link}
          href={`/activities/hour-of-code`}
          variant={activityType === 'hour-of-ai' ? 'contained' : 'outlined'}
          color={'primary'}
        >
          Legacy Hour of Code Activities
        </Button>
      </Stack>
    </Box>
  );
}
