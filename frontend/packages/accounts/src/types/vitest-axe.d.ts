// vitest-axe@0.1.0 augments the legacy global `Vi.Assertion` namespace, which
// vitest 4 no longer reads. Re-declare the matcher on the `vitest` module so
// `.toHaveNoViolations()` is typed on the assertion interfaces. The empty export
// makes this a module so the block augments `vitest` rather than shadowing it.
export {};

declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
