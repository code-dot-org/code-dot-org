import {
  createFileRoute,
  notFound,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import {useEffect, useState} from 'react';

import Congratulations from '@/components/launcher/Congratulations';
import Launcher from '@/components/launcher/Launcher';
import {isMobileBuild} from '@/config/buildMode';
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

// The icon font arrives only after the Font Awesome stylesheets load, so the
// first render waits for it, and text and icons appear together; it waits no
// longer than this, in case dsco.code.org is slow and the icons are not cached
// yet.
const ICON_WAIT_MS = 1000;

function iconsReady(): Promise<unknown> {
  const stylesheets = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'link[href*="/font-awesome-pro/"]',
    ),
    link =>
      new Promise(resolve => {
        // Loaded before this page mounted, so no load event is coming.
        if (link.sheet) {
          resolve(undefined);
        }
        link.addEventListener('load', resolve);
        link.addEventListener('error', resolve);
      }),
  );
  return Promise.race([
    Promise.all(stylesheets).then(() =>
      document.fonts.load('900 1em "Font Awesome 6 Pro"'),
    ),
    new Promise(resolve => setTimeout(resolve, ICON_WAIT_MS)),
  ]);
}

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
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const markLoaded = () => {
      if (mounted) {
        setIconsLoaded(true);
      }
    };
    iconsReady().then(markLoaded, markLoaded);
    return () => {
      mounted = false;
    };
  }, []);

  if (!iconsLoaded) {
    return null;
  }
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
  // Only the mobile build serves this page; the web shell answers not found.
  // Thrown from loader: router 1.139 hangs on a notFound thrown in beforeLoad.
  loader: () => {
    if (!isMobileBuild()) {
      throw notFound();
    }
  },
  component: App,
});
