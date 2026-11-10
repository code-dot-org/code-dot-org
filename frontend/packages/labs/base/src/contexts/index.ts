/**
 * Shared context hooks and types that labs import to read host-provided state.
 * Safe for any package to depend on — no shell, no circular-dependency risk.
 * (This is the `@code-dot-org/lab/contexts` entrypoint; upstream's src/contexts.ts
 * was folded in here so the directory is the single source.)
 */
export * from './DialogControlContext';
export * from './AppContext';
export * from './ShareContext';
export * from './LevelPropertiesContext';
export * from './SourcesContext';
export * from './ProjectContext';
export type {LevelPropertiesMap} from '../types';

// The lab-facing runtime registry (metrics reporter, lifecycle notifier).
export {default as LabRegistry} from '../LabRegistry';
