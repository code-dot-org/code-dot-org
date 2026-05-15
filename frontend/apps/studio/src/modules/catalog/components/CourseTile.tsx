import {Box, ButtonBase, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';

import type {Connectivity} from '@/modules/catalog/hooks/useCatalog';
import type {Course} from '@/modules/catalog/types';

interface Props {
  course: Course;
  connectivity: Connectivity;
}

/** True if the tile is tappable right now (cached, or online and non-cached). */
function isLaunchable(course: Course, connectivity: Connectivity): boolean {
  if (course.sampleOffline) return true;
  return connectivity === 'online';
}

const BADGE_STYLES = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
};

function ReadyBadge() {
  return (
    <Box
      sx={{
        ...BADGE_STYLES,
        backgroundColor: '#e8f5e9',
        color: '#1b5e20',
      }}
    >
      <span aria-hidden>✓</span> Ready offline
    </Box>
  );
}

function NeedsInternetBadge() {
  return (
    <Box
      sx={{
        ...BADGE_STYLES,
        backgroundColor: '#eceff1',
        color: '#455a64',
      }}
    >
      <span aria-hidden>☁</span> Needs internet
    </Box>
  );
}

export default function CourseTile({course, connectivity}: Props) {
  const launchable = isLaunchable(course, connectivity);
  const showOfflineMessage = !launchable;

  const inner = (
    <Box
      component={ButtonBase}
      disabled={!launchable}
      aria-label={`${course.title} — ${
        course.sampleOffline ? 'ready offline' : 'needs internet'
      }`}
      // 44px minimum tap target via min-height on the whole card.
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        alignItems: 'stretch',
        width: '100%',
        minHeight: '160px',
        padding: 0,
        borderRadius: '14px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        opacity: launchable ? 1 : 0.55,
        cursor: launchable ? 'pointer' : 'not-allowed',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': launchable
          ? {transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}
          : {},
        '&:focus-visible': {
          outline: '3px solid #00ADBC',
          outlineOffset: '2px',
        },
      }}
    >
      <Box
        component="img"
        src={course.illustration}
        alt=""
        aria-hidden
        sx={{
          width: '100%',
          height: '120px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <Box sx={{padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <Typography
          variant="subtitle1"
          sx={{fontWeight: 700, lineHeight: 1.2, fontSize: '16px'}}
        >
          {course.title}
        </Typography>
        {course.sampleOffline ? <ReadyBadge /> : <NeedsInternetBadge />}
        {showOfflineMessage && (
          <Typography
            variant="body2"
            sx={{color: '#546e7a', fontSize: '12px', marginTop: '4px'}}
          >
            Connect to the internet to play.
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (!launchable) {
    return inner;
  }

  return (
    <Link
      to="/lab/$slug"
      params={{slug: course.slug}}
      style={{textDecoration: 'none', color: 'inherit', display: 'block'}}
    >
      {inner}
    </Link>
  );
}
