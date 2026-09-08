// Ambient declarations for the @cdo/* modules the dev shell imports. Vite
// resolves them to apps/src at serve time; tsc resolves them here so
// typecheck never crawls apps' type graph.
//
// STUB — no business logic. Keep the surface to what src/dev/ actually uses.

declare module '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer' {
  import type {FC} from 'react';

  import type {RailsLessonDeepDiveData} from './fixtures';

  const LessonDeepDiveContainer: FC<{
    lessonDeepDiveData: RailsLessonDeepDiveData;
  }>;
  export default LessonDeepDiveContainer;
}

declare module '@cdo/apps/util/createReactRoot' {
  import type {ReactElement} from 'react';

  export function createReactRoot(
    component: ReactElement,
    container: Element | string,
    options?: {legacyReactDomRender?: boolean},
  ): void;
}

declare module '@cdo/apps/aiTutor/views/gallery/ChallengeGallery' {
  import type {FC} from 'react';

  import type {TutorGalleryData} from './galleryFixtures';

  const ChallengeGallery: FC<{tutorGalleryData: TutorGalleryData}>;
  export default ChallengeGallery;
}
