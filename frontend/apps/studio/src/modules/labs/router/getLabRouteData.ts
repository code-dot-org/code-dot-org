import {notFound} from '@tanstack/react-router';

import {getLabEntrypoint} from './getLabEntrypoint';
import {getLabFixtures} from './getLabFixtures';

export async function getLabRouteData(labType: string, channelId: string) {
  // Resolve the lazy entrypoint before mounting the host so an unknown lab
  // fails as a route error instead of rendering an empty lab shell.
  const LabEntrypoint = getLabEntrypoint(labType);
  if (!LabEntrypoint) {
    throw notFound();
  }

  if (import.meta.env.VITE_API_MODE === 'msw') {
    const [{registerLabFixtures, setActiveScenario}, fixtures] =
      await Promise.all([
        import('@code-dot-org/core/api/mocks'),
        getLabFixtures(labType),
      ]);

    if (fixtures) registerLabFixtures(labType, fixtures);
    setActiveScenario({labKey: labType, tag: channelId});
  }

  return {LabEntrypoint};
}
