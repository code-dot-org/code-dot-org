import {Box, Button, Typography} from '@mui/material';

import {useLevelProperties} from '@code-dot-org/lab/contexts';

import type {LabEntrypointProps} from '@/modules/labs/router/getLabEntrypointByAppName';

/**
 * Placeholder for standalone-video levels. Shows the level's title and a
 * Continue button that advances the lesson; the real video player is a
 * follow-up (the course navigation works with this stub in place).
 */
export default function StandaloneVideo({onContinue}: LabEntrypointProps) {
  const levelProperties = useLevelProperties();
  const title =
    (levelProperties?.displayName as string) ??
    (levelProperties?.name as string) ??
    'Video';

  return (
    <Box sx={{p: 4, textAlign: 'center'}}>
      <Typography variant="h5" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" sx={{mb: 3}} color="text.secondary">
        Video placeholder
      </Typography>
      {onContinue && (
        <Button variant="contained" onClick={onContinue}>
          Continue
        </Button>
      )}
    </Box>
  );
}
