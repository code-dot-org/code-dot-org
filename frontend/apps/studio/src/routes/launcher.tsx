import {useEffect, useState} from 'react';

import Launcher from '@/components/launcher/Launcher';
import Congratulations from '@/components/launcher/Congratulations';
import {
  CURRICULA,
  curriculumForCourse,
  firstLevelUrl,
  type Curriculum,
} from '@/config/curricula';

// MainActivity.kt opens #finished=<course> when a curriculum reaches its
// certificate page; the course is empty when unknown.
const FINISHED_FRAGMENT = '#finished=';
// MainActivity.kt handles this link and never loads it: it erases the
// session's progress and projects, then opens ?next= above the landing page.
const RESET_URL = 'https://studio.code.org/codeai-app/reset';

function openCurriculum(curriculum: Curriculum) {
  window.location.assign(curriculum.url);
}

function tryAgain(curriculum: Curriculum) {
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
  const [finishedCourse, setFinishedCourse] = useState(() =>
    finishedCourseIn(window.location.hash),
  );

  // Back from the congratulations returns to the curricula.
  useEffect(() => {
    function onHashChange() {
      setFinishedCourse(finishedCourseIn(window.location.hash));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (finishedCourse !== null) {
    return (
      <Congratulations
        curriculum={curriculumForCourse(finishedCourse)}
        onTryAgain={tryAgain}
        // The landing page without #finished is the entry before this one.
        onChooseAnother={() => window.history.back()}
      />
    );
  }
  return <Launcher curricula={CURRICULA} onOpen={openCurriculum} />;
}
