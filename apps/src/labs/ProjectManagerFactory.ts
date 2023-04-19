import {AppOptionsStore} from './AppOptionsStore';
import {S3ChannelsStore, LocalChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {S3SourcesStore, LocalSourcesStore} from './SourcesStore';
import {AppOptions, Project} from './types';

export default class ProjectManagerFactory {
  static createS3ProjectManager(
    appOptions: AppOptions,
    getProject: () => Project
  ): ProjectManager {
    const channelId = appOptions.channel;
    return new ProjectManager(
      channelId,
      new S3SourcesStore(),
      new S3ChannelsStore(),
      new AppOptionsStore(appOptions),
      getProject
    );
  }

  static createLocalProjectManager(
    appOptions: AppOptions,
    localStorageKey: string,
    getProject: () => Project
  ): ProjectManager {
    return new ProjectManager(
      localStorageKey,
      new LocalSourcesStore(),
      new LocalChannelsStore(),
      new AppOptionsStore(appOptions),
      getProject
    );
  }
}
