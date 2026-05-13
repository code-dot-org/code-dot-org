import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import {isLab, type Lab} from '@/modules/labs/types/lab';

// Lazy import of each lab's `./mocks` subpath. Mirrors `getLabEntrypoint`'s
// per-lab map so adding a lab only requires adding one entry here.
type LabFixturesLoader = () => Promise<{
  MusicFixtures?: LabFixtures;
  default?: LabFixtures;
  [key: string]: LabFixtures | undefined;
}>;

const LabFixturesLoaders: Record<Lab, LabFixturesLoader> = {
  music: () => import('@code-dot-org/music-lab/mocks'),
};

/**
 * Resolves the named-export fixtures for a lab — `MusicFixtures`,
 * `MazeFixtures`, etc. Returns `undefined` for unknown lab types.
 */
export async function getLabFixtures(
  labType: string,
): Promise<LabFixtures | undefined> {
  if (!isLab(labType)) return undefined;

  const mod = await LabFixturesLoaders[labType]();
  // Convention: each lab exports `<Lab>Fixtures` (e.g. MusicFixtures). Fall
  // back to default export, then the first LabFixtures-shaped value.
  const exportName = `${labType[0].toUpperCase()}${labType.slice(1)}Fixtures`;
  return (mod[exportName] ?? mod.default) as LabFixtures | undefined;
}
