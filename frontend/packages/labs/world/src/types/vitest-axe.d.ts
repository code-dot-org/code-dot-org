// vitest-axe@0.1.0 augments the legacy global `Vi.Assertion` namespace, which
// vitest 4 no longer reads, so re-declare the matcher on the `vitest` module.
// The empty export makes this a module so the block augments rather than shadows.
export {};

declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
