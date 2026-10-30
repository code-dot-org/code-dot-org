export type ConsentCategory =
  | 'strictly-necessary'
  | 'performance'
  | 'functional'
  | 'targeting';

/** Snapshot of consent categories granted by the active CMP. */
export interface ConsentState {
  categories: ReadonlySet<ConsentCategory>;
}

/**
 * Provider-independent consent signal: snapshot plus change feed.
 * `current()` starts at the strictly-necessary-only default and stays there
 * until a CMP reports in (deny-until-known); `subscribe` fires on every
 * state change, including the first one a CMP reports.
 */
export interface ConsentSource {
  current(): ConsentState;
  subscribe(listener: (state: ConsentState) => void): () => void;
}
