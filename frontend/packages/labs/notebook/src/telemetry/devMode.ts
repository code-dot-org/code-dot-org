/**
 * Single source of truth for the dev-mode flag within the telemetry layer.
 * Isolated in its own module so tests can mock it via vi.mock without fighting
 * ES module live-binding restrictions.
 * @returns `true` when running in a Vite development build.
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
