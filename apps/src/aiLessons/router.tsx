// Tiny client-side router for the AI Lessons SPA.  Every page path under
// /ai_lessons is served by the same Rails action + bundle; this module
// inspects window.location.pathname and turns it into a discriminated
// `Route` that AiLessonsApp uses to pick which page component to render.
//
// Navigation goes through `useNavigate()` (or the `<Link>` wrapper),
// which pushes onto the history stack without a full page reload.  The
// browser back/forward buttons are handled by a popstate listener that
// re-runs `matchRoute`.

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Route =
  | {kind: 'index'}
  | {kind: 'new'}
  | {kind: 'edit'; lessonId: string}
  | {kind: 'show'; lessonId: string}
  | {kind: 'progress'}
  | {kind: 'not-found'; path: string};

const PATTERNS: Array<(p: string) => Route | undefined> = [
  p =>
    p === '/ai_lessons' || p === '/ai_lessons/' ? {kind: 'index'} : undefined,
  p => (p === '/ai_lessons/new' ? {kind: 'new'} : undefined),
  p => (p === '/ai_lessons/progress' ? {kind: 'progress'} : undefined),
  p => {
    const m = p.match(/^\/ai_lessons\/([^/]+)\/edit$/);
    return m ? {kind: 'edit', lessonId: m[1]} : undefined;
  },
  p => {
    const m = p.match(/^\/ai_lessons\/([^/]+)$/);
    return m ? {kind: 'show', lessonId: m[1]} : undefined;
  },
];

export function matchRoute(pathname: string): Route {
  for (const matcher of PATTERNS) {
    const r = matcher(pathname);
    if (r) return r;
  }
  return {kind: 'not-found', path: pathname};
}

interface RouterContextValue {
  route: Route;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within <RouterProvider>');
  }
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}

export const RouterProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [route, setRoute] = useState<Route>(() =>
    matchRoute(window.location.pathname)
  );

  useEffect(() => {
    const handler = () => setRoute(matchRoute(window.location.pathname));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((path: string) => {
    if (path === window.location.pathname) return;
    window.history.pushState({}, '', path);
    setRoute(matchRoute(path));
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{route, navigate}}>
      {children}
    </RouterContext.Provider>
  );
};

// <Link> behaves like a plain <a> for SEO / right-click / middle-click /
// modifier-click, but intercepts left-clicks on AI-Lessons-internal URLs
// and routes them through the SPA history stack instead.
export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  onClick,
  children,
  ...rest
}) => {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      !href ||
      !href.startsWith('/ai_lessons')
    ) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };
  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
