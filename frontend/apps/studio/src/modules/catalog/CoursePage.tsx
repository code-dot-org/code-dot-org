import {Button, Container, Typography} from '@mui/material';

import Tags from '@code-dot-org/component-library/tags';

import type {CourseEntry} from './courses';

import moduleStyles from './CoursePage.module.scss';

type CoursePageProps = {
  entry: CourseEntry;
};

/**
 * Default course-detail renderer for content-only entries (no `module`,
 * no `externalUrl`). Shows the hero, summary, and a "Coming soon" CTA.
 *
 * FUTURE: this is the default fill for <Slot name="coursePage" />. When
 * an engineer module registers a coursePage slot, the slot system will
 * mount the registered component instead of this default.
 */
export default function CoursePage({entry}: CoursePageProps) {
  return (
    <Container maxWidth="md" className={moduleStyles.container}>
      <img src={entry.cover} alt="" className={moduleStyles.hero} />
      <Typography variant="h3" component="h1" className={moduleStyles.title}>
        {entry.title}
      </Typography>
      {entry.level && (
        <div className={moduleStyles.level}>
          <Tags tagsList={[{label: entry.level}]} size="s" />
        </div>
      )}
      <Typography variant="body1" className={moduleStyles.summary}>
        {entry.summary}
      </Typography>
      <div className={moduleStyles.callout}>
        <Typography variant="h6" className={moduleStyles.calloutTitle}>
          Mobile-native experience coming soon
        </Typography>
        <Typography variant="body2" className={moduleStyles.calloutBody}>
          This course is being reimagined for mobile. In the meantime, try it on
          a desktop browser.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component="a"
          href={`https://studio.code.org/courses/${entry.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on studio.code.org
        </Button>
      </div>
    </Container>
  );
}
