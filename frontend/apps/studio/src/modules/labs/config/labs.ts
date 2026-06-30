import type {ComponentType} from 'react';

import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import type {LabEntrypointProps} from '@/modules/labs/types/labEntrypoint';

/** A lazily-loaded `./mocks` module: a default and/or named `<Lab>Fixtures`. */
type LabFixturesModule = {
  default?: LabFixtures;
  [exportName: string]: LabFixtures | undefined;
};

/**
 * A `@code-dot-org/lab`-based lab wired into the studio host. Each lab ships a
 * default export that accepts {@link LabEntrypointProps} (the host-driven
 * loading contract) and, optionally, a `./mocks` subpath of MSW fixtures. The
 * host stays generic: registering a lab is one entry here — no per-lab studio
 * module, no bespoke container.
 *
 * `load`/`fixtures` use static `import()` specifiers on purpose: the bundler
 * only code-splits a lab into its own chunk when the specifier is a literal,
 * so this map cannot be collapsed to a single `import(packageName)`.
 */
interface LabRegistryEntry {
  load: () => Promise<{default: ComponentType<LabEntrypointProps>}>;
  fixtures?: () => Promise<LabFixturesModule>;
}

/** The registered labs, keyed by their `$labType` route segment. */
export const LAB_REGISTRY = {
  music: {
    load: () => import('@code-dot-org/music-lab'),
    fixtures: () => import('@code-dot-org/music-lab/mocks'),
  },
  oceans: {
    load: () => import('@code-dot-org/oceans-lab'),
    fixtures: () => import('@code-dot-org/oceans-lab/mocks'),
  },
} as const satisfies Record<string, LabRegistryEntry>;

/** A registered lab type (the `$labType` route segment). */
export type Lab = keyof typeof LAB_REGISTRY;

/** The list of registered lab types. */
export const AVAILABLE_LABS = Object.keys(LAB_REGISTRY) as Lab[];

/**
 * Type guard to check if a value is a registered Lab type.
 * @param value - The value to be checked.
 * @returns True if `value` is a registered lab type, false otherwise.
 */
export function isLab(value: unknown): value is Lab {
  return typeof value === 'string' && value in LAB_REGISTRY;
}
