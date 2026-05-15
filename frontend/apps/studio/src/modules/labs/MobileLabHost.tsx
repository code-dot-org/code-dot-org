import {Box, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';
import {Suspense, useEffect} from 'react';

import {getLabEntrypoint} from '@/modules/labs/router/getLabEntrypoint';
import {labTypeForSlug} from '@/modules/labs/slugs';
import {set} from '@/modules/storage/idb';

interface Props {
  slug: string;
}

/**
 * Mobile-shell lab host. Resolves a slug to a lab entrypoint, persists the
 * slug as `lastLaunchedSlug` so the catalog can show its Continue pill, and
 * lazy-loads the lab module.
 *
 * Note: this is the studio mobile entry path. The Rails-served studio still
 * uses its existing `/projects/$labType/$channelId/edit` routes; they are
 * untouched by this change.
 */
export default function MobileLabHost({slug}: Props) {
  const labType = labTypeForSlug(slug);
  const LabEntry = labType ? getLabEntrypoint(labType) : undefined;

  useEffect(() => {
    // Persist regardless of whether the lab exists yet — the user did intend
    // to launch this slug, and the catalog's Continue pill should reflect
    // their last *intent* not just a successful mount.
    set('lastLaunchedSlug', slug).catch(() => {
      // IDB write failure is non-fatal.
    });
  }, [slug]);

  if (!LabEntry) {
    return <LabNotAvailable slug={slug} />;
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Suspense fallback={<LabLoading title={slug} />}>
        <LabEntry studioMobile />
      </Suspense>
    </Box>
  );
}

function LabLoading({title}: {title: string}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Typography>Loading {title}…</Typography>
    </Box>
  );
}

function LabNotAvailable({slug}: {slug: string}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6">
        We don't have <strong>{slug}</strong> on this device yet.
      </Typography>
      <Typography variant="body2" sx={{color: '#546e7a', maxWidth: '320px'}}>
        Try connecting to the internet, or pick another course from the catalog.
      </Typography>
      <Link
        to="/"
        style={{
          marginTop: '8px',
          padding: '10px 18px',
          minHeight: '44px',
          borderRadius: '999px',
          backgroundColor: '#00ADBC',
          color: '#ffffff',
          textDecoration: 'none',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Back to catalog
      </Link>
    </Box>
  );
}
