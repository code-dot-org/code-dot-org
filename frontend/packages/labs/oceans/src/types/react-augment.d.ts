// This file is a module (has top-level export) so `declare module 'react'`
// here augments the existing @types/react rather than replacing it.
export {};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    // `inert` is a valid HTML attribute not yet in older @types/react versions.
    inert?: '' | undefined;
    /**
     * Radium accepts `style` as either a single CSSProperties object or an
     * array of objects (and falsy entries) which it merges at runtime.
     * Widen React's prop type so the lab's Radium-wrapped components can
     * pass arrays without per-call casts.
     */
    style?:
      | CSSProperties
      | ReadonlyArray<CSSProperties | false | null | undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SVGAttributes<T> {
    style?:
      | CSSProperties
      | ReadonlyArray<CSSProperties | false | null | undefined>;
  }
}
