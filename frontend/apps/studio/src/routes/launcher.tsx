import {
  createFileRoute,
  notFound,
  useLocation,
  useRouter,
} from '@tanstack/react-router';

import Congratulations from '@/components/launcher/Congratulations';
import Launcher from '@/components/launcher/Launcher';
import {isNativeBuild} from '@/config/buildMode';
import {
  CURRICULA,
  curriculumForCourse,
  firstLevelUrl,
  type Curriculum,
} from '@/config/curricula';

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

export const Route = createFileRoute('/launcher')({
  // Only the native build serves this page; the web shell answers not found.
  // Thrown from loader: router 1.139 hangs on a notFound thrown in beforeLoad.
  loader: () => {
    if (!isNativeBuild()) {
      throw notFound();
    }
  },
  component: App,
});
