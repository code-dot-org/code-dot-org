import type {Locator} from 'playwright/test';

/** Options accepted by the {@link VisualCheck} function. */
export interface VisualCheckOptions {
  /** Scope the check to a single element instead of the full window. */
  region?: Locator;
  /** Locators whose regions should be masked during comparison. */
  mask?: Locator[];
  /** Capture the full page (true, default) or just the viewport (false). Ignored when `region` is set. */
  fully?: boolean;
}

/** Provider-agnostic visual checkpoint function exposed by the fixture. */
export type VisualCheck = (
  name: string,
  opts?: VisualCheckOptions,
) => Promise<void>;

/** Per-consumer configuration for {@link createVisualTest}. */
export interface VisualTestConfig {
  /**
   * Applitools application name shown in the Eyes dashboard, e.g.
   * 'Code.org Oceans Lab'. One per consuming package.
   */
  appName: string;
}
