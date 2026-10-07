import type {AilabSnapshot} from '@code-dot-org/ailab';

import {AilabProjectSources} from './types';

export const DEFAULT_SOURCES: AilabProjectSources = {source: ''};

export function snapshotToSources(
  snapshot: AilabSnapshot
): AilabProjectSources {
  return {source: JSON.stringify(snapshot)};
}

export function sourcesToSnapshot(
  sources: AilabProjectSources
): AilabSnapshot | undefined {
  if (typeof sources.source !== 'string' || !sources.source) {
    return undefined;
  }
  try {
    return JSON.parse(sources.source);
  } catch {
    return undefined;
  }
}
