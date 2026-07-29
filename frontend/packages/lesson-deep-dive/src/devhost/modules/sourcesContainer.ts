// @cdo/apps/lab2/views/SourcesContainer
//
// ReactFlowCanvas names useSources only in a type position (its updateSources
// prop type). The whiteboard passes updateSources itself, so there is no lab2
// project to read or write here; this returns an inert context value.

interface InertSources {
  source: Record<string, never>;
}

export function useSources<T = InertSources>() {
  return {
    sources: undefined as T | undefined,
    updateSources: (_sources: T | ((previous: T) => T)) => undefined,
  };
}
