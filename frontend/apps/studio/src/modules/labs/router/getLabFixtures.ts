import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import {isLab, LAB_REGISTRY} from '@/modules/labs/config/labs';

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

  const loader = LAB_REGISTRY[labType].fixtures;
  if (!loader) return undefined;

  // The registry preserves each module's concrete shape (no string index
  // signature), so widen to a name-indexable view to look up the convention.
  const mod = (await loader()) as {
    default?: LabFixtures;
    [exportName: string]: LabFixtures | undefined;
  };
  // Falls back to the default export when the named export is absent.
  return mod[labFixturesExportName(labType)] ?? mod.default;
}
