/**
 * Course catalog manifest.
 *
 * Single source of truth for the catalog landing page. The entry shape
 * is deliberately the future `course.json` schema so the migration to
 * glob-discovered per-folder manifests is additive — same fields, just
 * a different loader.
 *
 * FUTURE: replace this const with
 *   import.meta.glob('./courses/*\/course.json', {eager: true})
 * + Zod validation.
 *
 * To add a course today, append an entry below. See README.md.
 */
// Per-course covers, sourced from studio.code.org's curriculum catalog.
// Drop a new file in this folder and import it as the entry's `cover`.
import aiForOceansCover from '@/config/brand/assets/courses/ai-for-oceans.png';
import appLabIntroCover from '@/config/brand/assets/courses/app-lab-intro.png';
import csDiscoveriesCover from '@/config/brand/assets/courses/cs-discoveries.png';
import csfCourseACover from '@/config/brand/assets/courses/csf-course-a.png';
import hourOfCodeDanceCover from '@/config/brand/assets/courses/hour-of-code-dance.jpg';
import howAiMakesDecisionsCover from '@/config/brand/assets/courses/how-ai-makes-decisions.png';
import type {Lab} from '@/modules/labs/types/lab';

/** Visual difficulty / grade-band hint shown on the card. */
export type CourseLevel = 'K-2' | 'K-5' | '3-5' | '6-8' | '9-12' | 'All ages';

/**
 * One catalog entry. `module` and `externalUrl` are mutually exclusive
 * (and either may be absent — a content-only entry routes to the
 * default CoursePage detail view).
 */
export type CourseEntry = {
  /** Schema version. Bump when the shape changes. */
  schemaVersion: 1;
  /** URL slug. Used in /app/courses/:slug for content-only entries. */
  slug: string;
  /** Card title. */
  title: string;
  /** One-sentence summary, ~120 chars. */
  summary: string;
  /** Cover image asset (resolved import). */
  cover: string;
  /** Grade band shown as a chip on the card. */
  level?: CourseLevel;
  /**
   * Lab module this course routes into. When set, clicking the card
   * goes to /app/projects/<module>/<demoChannelId>/edit.
   */
  module?: Lab;
  /** Channel id used for the lab route. Demo-only; real launches use a per-user channel. */
  demoChannelId?: string;
  /** External link (existing studio.code.org URL) for courses not yet ported. */
  externalUrl?: string;
};

export const COURSES: CourseEntry[] = [
  {
    schemaVersion: 1,
    slug: 'ai-for-oceans',
    title: 'AI for Oceans',
    summary:
      'Train an AI to sort ocean debris from sea life. Learn how machines recognize patterns from data.',
    cover: aiForOceansCover,
    level: 'K-5',
    module: 'oceans',
    demoChannelId: '1',
  },
  {
    schemaVersion: 1,
    slug: 'how-ai-makes-decisions',
    title: 'How AI Makes Decisions',
    summary:
      'Five lessons exploring how AI is trained, how it recognizes patterns, and how to use it responsibly.',
    cover: howAiMakesDecisionsCover,
    level: 'K-5',
    // FUTURE: when the mobile-native module ships, set:
    //   module: 'k5-ai-data'
    // For this iteration, content-only — routes to the default CoursePage
    // which links out to the existing desktop course.
  },
  {
    schemaVersion: 1,
    slug: 'hour-of-code-dance',
    title: 'Hour of Code: Dance Party',
    summary:
      'Code your own dance party with friends. A one-hour intro to coding through music and choreography.',
    cover: hourOfCodeDanceCover,
    level: 'All ages',
    externalUrl: 'https://studio.code.org/s/dance-2024',
  },
  {
    schemaVersion: 1,
    slug: 'csf-course-a',
    title: 'CS Fundamentals: Course A',
    summary:
      'Pre-readers begin a journey through computer science fundamentals — algorithms, loops, debugging.',
    cover: csfCourseACover,
    level: 'K-2',
    externalUrl: 'https://studio.code.org/s/coursea-2024',
  },
  {
    schemaVersion: 1,
    slug: 'app-lab-intro',
    title: 'App Lab Intro',
    summary:
      'Build a real app you can share. Drag-and-drop interface design plus blocks-to-JavaScript coding.',
    cover: appLabIntroCover,
    level: '6-8',
    externalUrl: 'https://studio.code.org/projects/applab/new',
  },
  {
    schemaVersion: 1,
    slug: 'cs-discoveries',
    title: 'CS Discoveries',
    summary:
      'A full-year introduction to computer science. Problem solving, web design, animation, physical computing.',
    cover: csDiscoveriesCover,
    level: '6-8',
    externalUrl: 'https://studio.code.org/courses/csd-2024',
  },
];
