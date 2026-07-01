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
  oceans: () => import('@code-dot-org/oceans-lab/mocks'),
};

/**
 * Derives the conventional fixtures export name for a lab key. Each lab
 * exports `<Lab>Fixtures` in PascalCase (e.g. MusicFixtures,
 * DancePartyFixtures). Lab keys are kebab-cased by convention
 * (`dance-party`), so PascalCase each hyphen-delimited segment.
 */
export function labFixturesExportName(labType: string): string {
  return `${labType
    .split('-')
    .map(segment =>
      segment.length > 0
        ? `${segment[0].toUpperCase()}${segment.slice(1)}`
        : segment,
    )
    .join('')}Fixtures`;
}

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
  // Falls back to the default export when the named export is absent.
  return (mod[labFixturesExportName(labType)] ?? mod.default) as
    | LabFixtures
    | undefined;
}
