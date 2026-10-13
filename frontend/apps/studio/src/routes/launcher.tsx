import {Capacitor} from '@capacitor/core';
import {createFileRoute, useLocation, useRouter} from '@tanstack/react-router';

import Congratulations from '@/modules/launcher/Congratulations';
import {
  CURRICULA,
  curriculumForCourse,
  firstLevelUrl,
  type Curriculum,
} from '@/modules/launcher/curricula';
import Launcher from '@/modules/launcher/Launcher';

export const Route = createFileRoute('/launcher')({component: LauncherPage});

// Native completion returns to this route with #finished=<course>.
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

function LauncherPage() {
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
