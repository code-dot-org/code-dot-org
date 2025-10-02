'use client';

import {Box, Button, Stack, Typography} from '@mui/material';

import Link from '@/components/contentful/link';
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
          fontSize: {xs: 36, md: 50},
          fontWeight: 800,
          letterSpacing: 0.2,
          mb: 1.5,
        }}
      >
        {activityType === ActivityType.HOUR_OF_CODE
          ? 'Explore Hour of Code Activities'
          : 'Explore Hour of AI Activities'}
      </Typography>

      <Typography
        variant="body2"
        sx={theme => ({
          color: 'text.secondary',
          mb: 3,
          '& a': {color: 'primary.main', textDecoration: 'none'},
          '& a:hover': {
            color: theme.palette.secondary.dark,
            textDecoration: 'underline',
          },
        })}
      >
        Teachers:{' '}
        <Link
          href="/hour-of-ai/partners#host-event"
          removeMarginBottom
          isLinkExternal={false}
        >
          Host an hour
        </Link>{' '}
        or{' '}
        <Link
          href="/hour-of-ai/how-to/k-12educator"
          removeMarginBottom
          isLinkExternal={false}
        >
          read the How-To Guide
        </Link>
      </Typography>
      {activityType === ActivityType.HOUR_OF_AI && (
        <>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              maxWidth: 760,
              mx: 'auto',
              mb: 1.5,
            }}
          >
            The new Hour of AI activity catalog launches on November 12, 2025,
            featuring the very best from our partners.
          </Typography>

          <Typography
            variant="body2"
            sx={{color: 'text.secondary', maxWidth: 760, mx: 'auto', mb: 3}}
          >
            And don’t worry — the most beloved Hour of Code activities aren’t
            going anywhere! While we focus our efforts on expanding
            high-quality, hands-on AI education, you can still explore the
            legacy Hour of Code catalog below.
          </Typography>
        </>
      )}

      {activityType === ActivityType.HOUR_OF_CODE && (
        <Typography
          variant="body2"
          sx={{color: 'text.secondary', maxWidth: 760, mx: 'auto'}}
        >
          The most beloved Hour of Code activities aren’t going anywhere while
          we focus our efforts on expanding high-quality, hands-on AI education.
          Explore legacy Hour of Code activities below.
        </Typography>
      )}

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{mt: {xs: 3.5, md: 3.5}, flexWrap: 'wrap', rowGap: 3}}
      >
        <Button
          href="/activities/hour-of-ai"
          variant={activityType === 'hour-of-ai' ? 'contained' : 'outlined'}
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Hour of AI Activities
        </Button>

        <Button
          href="/activities/hour-of-code"
          variant={activityType === 'hour-of-code' ? 'contained' : 'outlined'}
          color="primary"
          sx={{textDecoration: 'none'}}
        >
          Legacy Hour of Code Activities
        </Button>
      </Stack>
    </Box>
  );
}
