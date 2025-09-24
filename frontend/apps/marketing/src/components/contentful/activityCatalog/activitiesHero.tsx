import {Box, Button, Stack, Typography} from '@mui/material';
import Link from 'next/link';

export default function ActivitiesHero() {
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
        Teachers: <Link href="/host-an-hour">Host an hour</Link> or{' '}
        <Link href="/how-to-guide">read the How-To Guide</Link>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 760,
          mx: 'auto',
        }}
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
          variant="outlined"
          sx={{
            borderRadius: 999,
            px: 3.5,
            height: 56,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'primary.main',
          }}
          component={Link}
          href="/ai-activities"
        >
          AI Activities
        </Button>

        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 999,
            px: 3.5,
            height: 56,
            textTransform: 'none',
            fontWeight: 700,
          }}
          component={Link}
          href="/legacy-hour-of-code"
        >
          Legacy Hour of Code Activities
        </Button>
      </Stack>
    </Box>
  );
}
