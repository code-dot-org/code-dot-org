import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import {isLab, type Lab} from '@/modules/labs/types/lab';

// Lazy import of each lab's `./mocks` subpath. Mirrors `getLabEntrypoint`'s
// per-lab map. `Partial` — labs without fixtures are simply absent; the
// MSW handlers fall back to defaults for unmapped lab keys.
type LabFixturesLoader = () => Promise<{
  default?: LabFixtures;
  [key: string]: LabFixtures | undefined;
}>;

const LabFixturesLoaders: Partial<Record<Lab, LabFixturesLoader>> = {
  music: () => import('@code-dot-org/music-lab/mocks'),
};

/**
 * Resolves the named-export fixtures for a lab — `MusicFixtures`,
 * `MazeFixtures`, etc. Returns `undefined` for unknown lab types or labs
 * that don't expose a `./mocks` subpath yet.
 */
export async function getLabFixtures(
  labType: string,
): Promise<LabFixtures | undefined> {
  if (!isLab(labType)) return undefined;

  const loader = LabFixturesLoaders[labType];
  if (!loader) return undefined;

  const mod = await loader();
  // Convention: each lab exports `<Lab>Fixtures` (e.g. MusicFixtures). Fall
  // back to default export, then the first LabFixtures-shaped value.
  return (
    labType.length > 0
      ? (mod[`${labType[0].toUpperCase()}${labType.slice(1)}Fixtures`] ??
        mod.default)
      : mod.default
  ) as LabFixtures | undefined;
}
