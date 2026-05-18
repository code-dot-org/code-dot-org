import {Container, Typography} from '@mui/material';
import {Component, type ErrorInfo, type ReactNode} from 'react';

import CourseCard from './CourseCard';
import {COURSES, type CourseEntry} from './courses';

import moduleStyles from './Catalog.module.scss';

/**
 * Per-card error boundary. Named seam for VS Code-style module isolation:
 * one broken card cannot blank the whole catalog.
 *
 * FUTURE: lift into a shared <ModuleErrorBoundary> when the createModule()
 * registry lands.
 */
class CardErrorBoundary extends Component<
  {slug: string; children: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Catalog card crashed: ${this.props.slug}`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={moduleStyles.brokenCard}>
          <Typography variant="body2">
            Course &ldquo;{this.props.slug}&rdquo; failed to render. The rest of
            the catalog is unaffected.
          </Typography>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Course catalog landing page.
 *
 * CSS grid auto-fills 280px columns so the layout flexes from single-column
 * (mobile) to 4+ columns (wide desktop) without media queries. Each card is
 * isolated by an ErrorBoundary so a broken module cannot blank the catalog.
 */
export default function Catalog() {
  return (
    <Container maxWidth="lg" className={moduleStyles.container}>
      <Typography variant="h3" component="h1" className={moduleStyles.title}>
        Learn at Code.org
      </Typography>
      <Typography variant="body1" className={moduleStyles.subtitle}>
        Pick a course to get started. New experiences are rolling out
        mobile-first.
      </Typography>
      <div className={moduleStyles.grid}>
        {COURSES.map((entry: CourseEntry) => (
          <CardErrorBoundary key={entry.slug} slug={entry.slug}>
            <CourseCard entry={entry} />
          </CardErrorBoundary>
        ))}
      </div>
    </Container>
  );
}
