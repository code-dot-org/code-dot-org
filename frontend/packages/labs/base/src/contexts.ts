/**
 * Shared context hooks and types that labs import to read host-provided state.
 * Safe for any package to depend on — no shell, no circular-dependency risk.
 */
export {useLevelProperties} from './contexts/LevelPropertiesContext';
export type {LevelPropertiesMap} from './types';
