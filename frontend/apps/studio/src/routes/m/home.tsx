import {createFileRoute} from '@tanstack/react-router';

import {HomeView} from '@/modules/mobile-home/HomeView';

/** Validates `?lock=1` search param — present means kiosk/lock mode. */
function validateSearch(search: Record<string, unknown>): {lock?: boolean} {
  const locked = search.lock === '1' || search.lock === 1;
  return locked ? {lock: true} : {};
}

/** Journey-picker home screen — the Capacitor shell launches here after seats. */
export const Route = createFileRoute('/m/home')({
  validateSearch,
  component: HomeRouteComponent,
});

/** Reads lock search param and passes it to HomeView. */
function HomeRouteComponent(): JSX.Element {
  const {lock = false} = Route.useSearch();
  return <HomeView lock={lock} />;
}
