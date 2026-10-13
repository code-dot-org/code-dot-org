import {Capacitor} from '@capacitor/core';
import {useLocation, useRouter} from '@tanstack/react-router';

import Congratulations from './Congratulations';
import {
  CURRICULA,
  curriculumForCourse,
  firstLevelUrl,
  type Curriculum,
} from './curricula';
import Launcher from './Launcher';

// MainActivity.kt opens #finished=<course> when a curriculum reaches its
// certificate page; the course is empty when unknown.
const FINISHED_FRAGMENT = 'finished=';
// MainActivity.kt handles this link and never loads it: it erases the
// session's progress and projects, then opens ?next= above the landing page.
const RESET_URL = 'https://studio.code.org/codeai-app/reset';

function openCurriculum(curriculum: Curriculum) {
  window.location.assign(curriculum.url);
}

function tryAgain(curriculum: Curriculum) {
  if (!Capacitor.isNativePlatform()) {
    window.location.assign(firstLevelUrl(curriculum));
    return;
  }
  const next = encodeURIComponent(firstLevelUrl(curriculum));
  window.location.assign(`${RESET_URL}?next=${next}`);
}

function finishedCourseIn(hash: string): string | null {
  return hash.startsWith(FINISHED_FRAGMENT)
    ? decodeURIComponent(hash.slice(FINISHED_FRAGMENT.length))
    : null;
}

/**
 * Root of the Capacitor build. A curriculum replaces this page in the WebView;
 * the logo the app links in the site header, and Android Back, bring the
 * child back. Finishing a curriculum brings them back to its congratulations.
 */
export default function App() {
  const hash = useLocation({select: location => location.hash});
  const router = useRouter();
  const finishedCourse = finishedCourseIn(hash);

  if (finishedCourse !== null) {
    return (
      <Congratulations
        curriculum={curriculumForCourse(finishedCourse)}
        onTryAgain={tryAgain}
        // The landing page without #finished is the entry before this one.
        onChooseAnother={() => router.history.back()}
      />
    );
  }
  return <Launcher curricula={CURRICULA} onOpen={openCurriculum} />;
}
