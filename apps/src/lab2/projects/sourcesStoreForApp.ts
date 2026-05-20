import {JavalabSourcesStore} from '@cdo/apps/javalab/lab2/JavalabSourcesStore';

import {AppName} from '../types';

import {SourcesStore} from './SourcesStore';

// Return the SourcesStore appropriate for a given lab2 app. Most apps use
// the default SourcesStore, which serializes the in-Redux MultiFileSource
// to S3 verbatim. Java Lab is the exception: its S3 payload must remain
// in the legacy flat shape that Javabuilder reads, so it gets a subclass
// that converts at the wire boundary.
export function getSourcesStoreForApp(
  appName: AppName | undefined
): SourcesStore {
  if (appName === 'javalab') {
    return new JavalabSourcesStore();
  }
  return new SourcesStore();
}
