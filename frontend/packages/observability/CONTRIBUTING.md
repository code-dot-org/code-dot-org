# Contributing to @code-dot-org/observability

## Adding a New Provider Adapter

1. Create `src/adapters/<provider>.ts` implementing the `RumClient` interface from `src/types.ts`
2. Define a `<PROVIDER>_PRIVACY_COMPLIANCE` const grouping all privacy-required SDK options
3. Implement `AdapterState` with `initialized` and `degraded` flags
4. Guard `init` with `isBrowser()` from `src/internal/ssrGuard.ts`
5. Wrap all SDK calls in try/catch; log warnings and set `degraded = true` on failure
6. Add the new provider to the `RumProvider` union type in `src/types.ts`
7. Add a `case` for the new provider in the `createRumClient` switch in `src/index.ts`
8. Add unit and property-based tests in `src/adapters/__tests__/<provider>.test.ts`
9. Add the provider SDK as a `peerDependency` in `package.json`
10. Update `README.md` with the new provider's usage example
