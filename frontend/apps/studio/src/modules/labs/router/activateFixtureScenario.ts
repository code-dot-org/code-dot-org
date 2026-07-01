import {AVAILABLE_LABS} from '@/modules/labs/config/labs';
import {getLabFixtures} from '@/modules/labs/router/getLabFixtures';

/**
 * MSW-only: find which lab's fixture defines the given level and activate that
 * scenario, so a bare `/levels/$levelId` fetch resolves without knowing the lab
 * type up front — the route derives the lab from the fetched level properties.
 *
 * In production this is unnecessary (the real backend answers by level id); it
 * exists only to break the mock's chicken-and-egg (the level-properties fetch
 * needs a registered fixture, but the fixture is keyed by lab). Returns true if
 * a scenario was activated.
 */
export async function activateFixtureScenarioForLevel(
  levelId: number,
): Promise<boolean> {
  const {registerLabFixtures, setActiveScenario} = await import(
    '@code-dot-org/core/api/mocks'
  );

  const key = String(levelId);
  for (const labType of AVAILABLE_LABS) {
    const fixtures = await getLabFixtures(labType);
    if (!fixtures) continue;

    for (const [tag, fixture] of Object.entries(fixtures)) {
      if (fixture.levelProperties && key in fixture.levelProperties) {
        registerLabFixtures(labType, fixtures);
        setActiveScenario({labKey: labType, tag});
        return true;
      }
    }
  }

  return false;
}
