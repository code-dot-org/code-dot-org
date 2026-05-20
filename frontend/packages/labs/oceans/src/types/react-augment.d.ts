// This file is a module (has top-level export) so `declare module 'react'`
// here augments the existing @types/react rather than replacing it.
export {};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    // `inert` is a valid HTML attribute not yet in older @types/react versions.
    inert?: '' | undefined;
  }
}
