import {Card, CardContent, CardMedia, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';

import Tags from '@code-dot-org/component-library/tags';

import type {CourseEntry} from './courses';

import moduleStyles from './CourseCard.module.scss';

type CourseCardProps = {
  entry: CourseEntry;
};

/**
 * Catalog card for a single course. Routes branch on entry shape:
 * - `mobileRoute` → internal mobile-native flow (e.g. /app/m/seats)
 * - `module` + `demoChannelId` → /app/projects/<module>/<channelId>/edit
 * - `externalUrl` → opens existing studio.code.org URL in a new tab
 * - neither → /app/courses/<slug> default detail page
 *
 * TanStack `preload="intent"` warms the lab chunk on hover/touch-start
 * so the lazy import has already parsed by the time the user taps.
 */
export default function CourseCard({entry}: CourseCardProps) {
  const isMobileNative = Boolean(entry.mobileRoute);
  const isInternalLab = Boolean(entry.module && entry.demoChannelId);
  const isExternal = Boolean(entry.externalUrl);

  const cardBody = (
    <Card className={moduleStyles.card}>
      <CardMedia
        component="img"
        image={entry.cover}
        alt=""
        className={moduleStyles.cover}
      />
      <CardContent className={moduleStyles.body}>
        <Typography variant="h6" component="h2">
          {entry.title}
        </Typography>
        {entry.level && (
          <div className={moduleStyles.level}>
            <Tags tagsList={[{label: entry.level}]} size="s" />
          </div>
        )}
        <Typography variant="body2" className={moduleStyles.summary}>
          {entry.summary}
        </Typography>
      </CardContent>
    </Card>
  );

  if (isMobileNative) {
    return (
      <Link
        to={entry.mobileRoute!}
        preload="intent"
        className={moduleStyles.cardLink}
      >
        {cardBody}
      </Link>
    );
  }

  if (isInternalLab) {
    return (
      <Link
        to="/projects/$labType/$channelId/edit"
        params={{labType: entry.module!, channelId: entry.demoChannelId!}}
        preload="intent"
        className={moduleStyles.cardLink}
      >
        {cardBody}
      </Link>
    );
  }

  if (isExternal) {
    return (
      <a
        href={entry.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={moduleStyles.cardLink}
      >
        {cardBody}
      </a>
    );
  }

  return (
    <Link
      to="/courses/$slug"
      params={{slug: entry.slug}}
      className={moduleStyles.cardLink}
    >
      {cardBody}
    </Link>
  );
}
