import {Box, Button, Typography} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
import {Link} from '@tanstack/react-router';

interface LevelRef {
  position: number;
  path: string;
}

interface LevelNavigationProps {
  currentPosition: number;
  levels: LevelRef[];
}

/** Temporary navigation while progress bubbles are built; remove once they land. */
export default function LevelNavigation({
  currentPosition,
  levels,
}: LevelNavigationProps) {
  const currentIndex = levels.findIndex(l => l.position === currentPosition);
  const prev = currentIndex > 0 ? levels[currentIndex - 1] : undefined;
  const next =
    currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined;

  return (
    <Box
      component="nav"
      aria-label="Level navigation"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 1,
      }}
    >
      {prev ? (
        <Button component={Link} to={prev.path} size="small">
          Previous level
        </Button>
      ) : (
        <Button disabled size="small">
          Previous level
        </Button>
      )}

      {/* aria-live announces the position to screen readers on every level
          change without requiring the user to navigate to this element. */}
      <Typography variant="body2" aria-live="polite" aria-atomic="true">
        <Box component="span" sx={visuallyHidden}>
          Current position:{' '}
        </Box>
        Level {currentPosition} of {levels.length}
      </Typography>

      {next ? (
        <Button component={Link} to={next.path} size="small">
          Next level
        </Button>
      ) : (
        <Button disabled size="small">
          Next level
        </Button>
      )}
    </Box>
  );
}
