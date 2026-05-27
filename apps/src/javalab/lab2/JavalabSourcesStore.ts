import {SourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import {
  MultiFileSource,
  ProjectSources,
  ProjectType,
} from '@cdo/apps/lab2/types';

import {flatToMultiFile, multiFileToFlat} from './sourceConverter';
import {JavalabFlatSource} from './types';

// Java Lab persists sources to S3 in a legacy flat shape
// ({filename: {text, tabOrder, isVisible, isValidation}}) for compatibility
// with Javabuilder, which reads the same main.json. Codebridge, however,
// expects MultiFileSource. This store mediates: load() converts S3's flat
// shape into MultiFileSource; save() converts back before writing.
export class JavalabSourcesStore extends SourcesStore {
  async load(channelId: string, versionId?: string) {
    const raw = await super.load(channelId, versionId);
    if (!raw || !raw.source) return raw;
    return {
      ...raw,
      source: flatToMultiFile(raw.source as unknown as JavalabFlatSource),
    } as ProjectSources;
  }

  async save(
    channelId: string,
    sources: ProjectSources,
    projectType?: ProjectType,
    forceNewVersion = false
  ) {
    const flat = {
      ...sources,
      source: multiFileToFlat(sources.source as MultiFileSource),
    } as unknown as ProjectSources;
    return super.save(channelId, flat, projectType, forceNewVersion);
  }
}
