// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {ThemeProvider} from '@mui/material';
import {createRootRoute, Outlet, useRouter} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {useCallback} from 'react';

import Header, {
  type CreateMenuItem,
} from '@code-dot-org/component-library/header';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import StudioFooter from '@/components/footer';
import CodeAILogo from '@/config/brand/assets/logo-codeai-inverse.svg';
import {fetchAuthOutcome, useAuth} from '@/modules/auth';
import Bootstrap from '@/modules/bootstrap';
import {AuthErrorPage} from '@/modules/errors';

const STUDENT_MENU_ITEMS = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '//code.org/students'},
  {label: 'Projects', href: '/projects'},
  {label: 'Incubator', href: '//code.org/incubator'},
];

const TEACHER_MENU_ITEMS = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '/catalog'},
  {label: 'Projects', href: '/projects'},
  {label: 'Professional Learning', href: '/my-professional-learning'},
  {label: 'Incubator', href: '//code.org/incubator'},
];

const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  {
    id: 'music_dance_ai',
    label: 'Mix & Move with AI',
    href: '//code.org/mix-move-ai',
    iconUrl: '/shared/images/fill-70x70/courses/music-dance-ai-icon.png',
  },
  {
    id: 'spritelab',
    label: 'Sprite Lab',
    href: '/projects/spritelab/new',
    iconUrl: '/shared/images/fill-70x70/courses/sprite-lab-icon.png',
  },
  {
    id: 'applab',
    label: 'App Lab',
    href: '/projects/applab/new',
    iconUrl: '/shared/images/fill-70x70/courses/app-lab-icon.png',
  },
  {
    id: 'gamelab',
    label: 'Game Lab',
    href: '/projects/gamelab/new',
    iconUrl: '/shared/images/fill-70x70/courses/game-lab-icon.png',
  },
  {
    id: 'weblab2',
    label: 'Web Lab (New)',
    href: '/projects/weblab2/new',
    iconUrl: '/shared/images/fill-70x70/courses/web-lab-icon.png',
  },
  {
    id: 'music',
    label: 'Music Lab',
    href: '/projects/music/new',
    iconUrl: '/shared/images/fill-70x70/courses/music-lab-icon.png',
  },
  {
    id: 'pythonlab',
    label: 'Python Lab',
    href: '/projects/pythonlab/new',
    iconUrl: '/shared/images/fill-70x70/courses/python-lab-icon.png',
  },
  {
    id: 'artist',
    label: 'Artist',
    href: '/projects/artist/new',
    iconUrl: '/shared/images/fill-70x70/courses/artist-icon.png',
  },
  {
    id: 'dance',
    label: 'Dance',
    href: '/projects/dance/new',
    iconUrl: '/shared/images/fill-70x70/courses/dance-icon.png',
  },
  {
    id: 'view_all',
    label: 'View all projects...',
    href: '/projects',
    iconUrl: '/shared/images/courses/header-all-projects-icon.png',
  },
];

/**
 * Maps auth status to the route content area.
 * Returns the outlet for non-error states; the auth error page on failure.
 *
 * @param auth - Current auth outcome from the root route context.
 * @param onRetry - Calls `router.invalidate()` to re-run `beforeLoad`.
 * @returns The content node for the current auth status.
 */
function renderRouteArea(
  auth: ReturnType<typeof useAuth>,
  onRetry: () => void,
): React.ReactNode {
  switch (auth.status) {
    case 'signed-in':
    case 'signed-out':
      return <Outlet />;
    case 'error':
      return (
        <AuthErrorPage
          onRetry={onRetry}
          observabilityEventId={auth.observabilityEventId}
        />
      );
    default: {
      const _: never = auth;
      throw new Error(`Unhandled auth status: ${JSON.stringify(_)}`);
    }
  }
}

/**
 * Renders the page shell: header, route content area, and devtools.
 * Auth state drives both the header user area and the content area.
 * `onRetry` calls `router.invalidate()` to re-run `beforeLoad`.
 */
function RootContent() {
  const auth = useAuth();
  const router = useRouter();
  const onRetry = useCallback(() => router.invalidate(), [router]);

  const menuItems =
    auth.status === 'signed-in' && auth.user_type === 'teacher'
      ? TEACHER_MENU_ITEMS
      : STUDENT_MENU_ITEMS;

  return (
    <>
      <Header
        logoImageUrl={CodeAILogo}
        brandName="CodeAI"
        menuItems={menuItems}
        userAuth={auth}
        createMenuItems={CREATE_MENU_ITEMS}
      />
      {renderRouteArea(auth, onRetry)}
      <StudioFooter />
      <TanStackRouterDevtools />
    </>
  );
}

/** Root layout: applies the CDO MUI theme and Bootstrap providers to all routes. */
function RootLayout() {
  return (
    <ThemeProvider theme={CdoTheme}>
      <Bootstrap locale="en-US">
        <RootContent />
      </Bootstrap>
    </ThemeProvider>
  );
}

/**
 * TanStack Router root route definition.
 * `beforeLoad` fetches auth once per navigation before any component renders,
 * eliminating the useEffect bootstrap pattern and StrictMode double-fetch.
 */
export const Route = createRootRoute({
  beforeLoad: async () => ({auth: await fetchAuthOutcome()}),
  component: RootLayout,
});
