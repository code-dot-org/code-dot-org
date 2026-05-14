// Feature-gating utilities — opt-in flags and dynamic config. Backends that
// ship analytics events live under `@code-dot-org/core/plugins/*`:
//
//   - product analytics (Statsig)   → @code-dot-org/core/plugins/analytics
//   - GTM pageview / event tracking → @code-dot-org/core/plugins/gtm

export {default as DCDO} from './dcdo';
export * as experiments from './experiments';
