import type {MultiFileSource} from '@code-dot-org/core/api';

// The runtime runs off the React tree (a worker message handler), so it cannot
// reach the SourcesContext directly. The lab registers a writer on mount and the
// message router calls it when the worker returns an updated project.
//
// Legacy dispatches `setAndSaveSource` from its worker manager instead; this
// package keeps sources in the SourcesContext rather than redux, so the write
// has to go back through the provider.

type SourceWriter = (source: MultiFileSource) => void;

let writer: SourceWriter | null = null;

/** Register the callback that folds a run's updated project back in. */
export function registerSourceWriter(next: SourceWriter | null) {
  writer = next;
}

/** Write a run's updated project back, if the lab is mounted. */
export function writeUpdatedSource(source: MultiFileSource) {
  writer?.(source);
}
