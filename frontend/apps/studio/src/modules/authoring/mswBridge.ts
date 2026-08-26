// MSW bridge for authored curriculum: real labs (Oceans, Music) mounted from
// an authored lesson fetch level properties through the normal API path; in
// standalone mode MSW intercepts that request and this bridge answers it from
// the authoring service, which derived the properties from the real `.level`
// files at import time.
//
// Synthetic numeric ids (the importer assigns from SYNTHETIC_LEVEL_ID_FLOOR
// up) mark authored/imported levels; anything below falls through to the
// regular fixture/default handlers untouched.

export const SYNTHETIC_LEVEL_ID_FLOOR = 9_000_000;

// The three /author routes each call this from their loader, so calls can
// overlap; cache the in-flight promise so they share one registration
// instead of racing, and clear it on failure so a later call can retry
// rather than latching a broken "registered" flag forever.
let registrationPromise: Promise<void> | undefined;

/** Register the global MSW routes once. No-op outside MSW mode. */
export function registerAuthoringMswBridge(): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') {
    return Promise.resolve();
  }
  if (!registrationPromise) {
    registrationPromise = registerRoutes().catch(error => {
      registrationPromise = undefined;
      throw error;
    });
  }
  return registrationPromise;
}

async function registerRoutes(): Promise<void> {
  const {registerMockFixture} = await import('@code-dot-org/core/api/mocks');
  // A fetch issued inside an MSW resolver is itself intercepted, which
  // deadlocks the resolver; bypass() marks it to go straight to the network
  // (the Vite proxy to the authoring service).
  const {bypass} = await import('msw');

  registerMockFixture([
    {
      path: '*/levels/:levelId/level_properties',
      respond: async ({params}) => {
        const levelId = Number(params.levelId);
        if (!Number.isFinite(levelId) || levelId < SYNTHETIC_LEVEL_ID_FLOOR) {
          return undefined; // not ours: fall through
        }
        const res = await fetch(
          bypass(
            new URL(
              `/authoring-api/levels/${levelId}/level_properties`,
              window.location.origin,
            ),
          ),
        );
        if (!res.ok) {
          return undefined;
        }
        return (await res.json()) as Record<string, unknown>;
      },
    },
  ]);
}
