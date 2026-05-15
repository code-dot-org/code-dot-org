import {Box, useMediaQuery} from '@mui/material';
import {Link} from '@tanstack/react-router';
import {useEffect, useState} from 'react';

import ConnectivityChip from '@/modules/catalog/components/ConnectivityChip';
import CourseTile from '@/modules/catalog/components/CourseTile';
import {useCatalog} from '@/modules/catalog/hooks/useCatalog';
import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import {get} from '@/modules/storage/idb';

const COLUMN_GAP_PX = 12;

function useLastLaunchedSlug(): string | undefined {
  const [slug, setSlug] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    get('lastLaunchedSlug').then(v => {
      if (alive) setSlug(v);
    });
    return () => {
      alive = false;
    };
  }, []);
  return slug;
}

export default function CatalogScreen() {
  const {catalog, connectivity} = useCatalog();
  const lastLaunchedSlug = useLastLaunchedSlug();
  // MUI breakpoints: sm=600, md=900, lg=1200. We pin the phone/tablet/desktop
  // split at the spec-mandated 768 / 1024 boundaries.
  const isPhone = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  let columns = 4;
  if (isPhone) columns = 2;
  else if (isTablet) columns = 3;

  const continueCourse = catalog?.courses.find(
    c => c.slug === lastLaunchedSlug,
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: {xs: '12px', md: '24px'},
        gap: {xs: '12px', md: '20px'},
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <Box
          component="img"
          src={CdoLogo}
          alt="Code.org"
          sx={{
            height: {xs: '32px', md: '40px'},
            width: 'auto',
            display: 'block',
          }}
        />
        <ConnectivityChip state={connectivity} />
      </Box>

      {/* Desktop/tablet: continue affordance at top. Phone: a sticky pill at bottom. */}
      {!isPhone && continueCourse && (
        <ContinueAffordance
          slug={continueCourse.slug}
          title={continueCourse.title}
          variant="top"
        />
      )}

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${COLUMN_GAP_PX}px`,
          paddingBottom: isPhone && continueCourse ? '88px' : 0,
        }}
      >
        {catalog?.courses.map(course => (
          <Box component="li" key={course.slug} sx={{display: 'flex'}}>
            <CourseTile course={course} connectivity={connectivity} />
          </Box>
        ))}
      </Box>

      {isPhone && continueCourse && (
        <ContinueAffordance
          slug={continueCourse.slug}
          title={continueCourse.title}
          variant="phone-pill"
        />
      )}
    </Box>
  );
}

function ContinueAffordance({
  slug,
  title,
  variant,
}: {
  slug: string;
  title: string;
  variant: 'top' | 'phone-pill';
}) {
  const isPhonePill = variant === 'phone-pill';
  return (
    <Box
      sx={
        isPhonePill
          ? {
              position: 'fixed',
              left: '12px',
              right: '12px',
              // Sits above the iOS home-indicator safe area.
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
              zIndex: 10,
            }
          : {alignSelf: 'flex-start'}
      }
    >
      <Link
        to="/lab/$slug"
        params={{slug}}
        style={{textDecoration: 'none'}}
        aria-label={`Continue: ${title}`}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '48px',
            padding: '0 18px',
            borderRadius: '999px',
            backgroundColor: '#00ADBC',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: isPhonePill
              ? '0 6px 18px rgba(0,0,0,0.18)'
              : '0 2px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            width: isPhonePill ? '100%' : 'auto',
          }}
        >
          Continue: {title}
        </Box>
      </Link>
    </Box>
  );
}
