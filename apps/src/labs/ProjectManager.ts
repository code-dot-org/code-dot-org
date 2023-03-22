import {SourcesStore} from './SourcesStore';
import {ChannelsStore} from './ChannelsStore';
import {Project} from './types';

export enum ProjectManagerEvent {
  SaveStart,
  SaveNoop,
  SaveSuccess,
  SaveFail
}

export default class ProjectManager {
  channelId: string;
  sourcesStore: SourcesStore;
  channelsStore: ChannelsStore;
  getProject: () => Project;

  private saveInProgress: boolean = false;
  private eventListeners: {
    [key in keyof typeof ProjectManagerEvent]?: [(response: Response) => void]
  } = {};

  constructor(
    channelId: string,
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    getProject: () => Project
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
    this.getProject = getProject;
  }

  async load(): Promise<Response> {
    const sourceResponse = await this.sourcesStore.load(this.channelId);
    if (!sourceResponse.ok) {
      return sourceResponse;
    }

    const channelResponse = await this.channelsStore.load(this.channelId);
    if (!channelResponse.ok) {
      return channelResponse;
    }

    const source = await sourceResponse.json();
    const channel = await channelResponse.json();
    const project = {source, channel};
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json'
    });
    return new Response(blob);
  }

  // TODO: Add functionality to reduce channel updates during
  // HoC "emergency mode" (see 1182-1187 in project.js).
  async save(): Promise<Response> {
    if (this.saveInProgress) {
      const noopResponse = new Response(null, {status: 304});
      this.executeListeners(ProjectManagerEvent.SaveNoop, noopResponse);
      return noopResponse;
    }

    this.saveInProgress = true;
    this.executeListeners(ProjectManagerEvent.SaveStart);
    const project = this.getProject();
    const sourceResponse = await this.sourcesStore.save(
      this.channelId,
      project.source
    );
    if (!sourceResponse.ok) {
      this.saveInProgress = false;
      this.executeListeners(ProjectManagerEvent.SaveFail, sourceResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return sourceResponse;
    }

    const channelResponse = await this.channelsStore.save(project.channel);
    if (!channelResponse.ok) {
      this.saveInProgress = false;
      this.executeListeners(ProjectManagerEvent.SaveFail, channelResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return channelResponse;
    }

    this.saveInProgress = false;
    this.executeListeners(ProjectManagerEvent.SaveSuccess);
    return new Response();
  }

  addEventListener(type: ProjectManagerEvent, listener: () => void) {
    if (this.eventListeners[type]) {
      this.eventListeners[type]?.push(listener);
    } else {
      this.eventListeners[type] = [listener];
    }
  }

  private executeListeners(type: ProjectManagerEvent, response: Response = new Response()) {
    this.eventListeners[type]?.forEach(listener => listener(response));
  }
}
