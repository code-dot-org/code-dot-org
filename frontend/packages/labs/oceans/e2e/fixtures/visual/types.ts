import type {Locator} from 'playwright/test';

/** Options accepted by the {@link VisualCheck} function. */
export interface VisualCheckOptions {
  /** Locators whose regions should be masked during comparison. */
  mask?: Locator[];
}

/** Provider-agnostic visual checkpoint function exposed by the fixture. */
export type VisualCheck = (
  name: string,
  opts?: VisualCheckOptions,
) => Promise<void>;
