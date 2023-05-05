/**
 * ProjectManager manages loading and saving projects that have a source
 * and channel component, and are indexed on a channel id (or other unique identifier).
 * It accepts a sources and channels store, which handle communication with the relevant
 * apis for loading and saving sources and channels.
 *
 * ProjectManager throttles saves to only occur once every 30 seconds, unless a force
 * save is requested. If save is called within 30 seconds of the previous save,
 * the save is queued and will be executed after the 30 second interval has passed.
 */
import {SourcesStore} from './SourcesStore';
import {ChannelsStore} from './ChannelsStore';
import {Project} from '../types';

export enum ProjectManagerEvent {
  SaveStart,
  SaveNoop,
  SaveSuccess,
  SaveFail,
}

export default class ProjectManager {
  // Channel id can be provided at initialization, or set later via load(levelId).
  // We support both paths so that /projects can be created with a specific channel id,
  // or we can load a channel for a level.
  channelId: string | undefined;
  sourcesStore: SourcesStore;
  channelsStore: ChannelsStore;
  getProject: () => Project;

  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private eventListeners: {
    [key in keyof typeof ProjectManagerEvent]?: [(response: Response) => void];
  } = {};
  private lastSource: string | undefined;
  private lastChannel: string | undefined;

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    getProject: () => Project,
    channelId: string | undefined
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
    this.getProject = getProject;
  }

  // First, get the channel id associated with the level and script
  // (or just the level if no script was provided).
  // Then, load the project from the sources and channels store.
  async loadForLevel(levelId: string, scriptName?: string): Promise<Response> {
    const setLevelResponse = await this.setLevel(levelId, scriptName);
    if (!setLevelResponse.ok) {
      return setLevelResponse;
    }

    return await this.load();
  }

  // Load the project from the sources and channels store.
  async load(): Promise<Response> {
    // It's possible to not have a channel id set if the level has not been set already
    // or we were not given a channelId on initialization.
    if (!this.channelId) {
      return this.getNoChannelResponse();
    }
    const sourceResponse = await this.sourcesStore.load(this.channelId);
    // If sourceResponse is not ok, we still want to load the channel. Source can
    // return not found if the project is new.
    let source = {};
    if (sourceResponse.ok) {
      source = await sourceResponse.json();
      this.lastSource = JSON.stringify(source);
    }

    const channelResponse = await this.channelsStore.load(this.channelId);
    if (!channelResponse.ok) {
      return channelResponse;
    }

    const channel = await channelResponse.json();
    this.lastChannel = JSON.stringify(channel);
    const project = {source, channel};
    const blob = new Blob([JSON.stringify(project)], {
      type: 'application/json',
    });
    return new Response(blob);
  }

  hasUnsavedChanges(): boolean {
    const project = this.getProject();
    return this.sourceChanged(project) || this.channelChanged(project);
  }

  // TODO: Add functionality to reduce channel updates during
  // HoC "emergency mode" (see 1182-1187 in project.js).
  /**
   * Enqueue a save to happen in the next saveInterval, unless a force save is requested.
   * On a save, we get the project, which consists of a source and a channel. We
   * first save the source. Only if the source save succeeds do we update the channel, as the
   * channel is metadata about the project and we don't want to save it unless the source
   * save succeeded.
   * @param forceSave boolean: if the save should happen immediately
   * @returns a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async save(forceSave = false): Promise<Response> {
    if (!this.channelId) {
      return this.getNoChannelResponse();
    }
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        this.enqueueSave();
      }
      return this.getNoopResponse();
    }
    this.saveInProgress = true;
    this.saveQueued = false;
    this.nextSaveTime = Date.now() + this.saveInterval;
    this.executeListeners(ProjectManagerEvent.SaveStart);
    const project = this.getProject();
    const sourceChanged = this.sourceChanged(project);
    const channelChanged = this.channelChanged(project);
    // If neither source nor channel has actually changed, no need to save again.
    if (!sourceChanged && !channelChanged) {
      this.saveInProgress = false;
      return this.getNoopResponse();
    }
    // Only save the source if it has changed.
    if (sourceChanged) {
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
      this.lastSource = JSON.stringify(project.source);
    }

    // Always save the channel--either the channel has changed and/or the source changed.
    // Even if only the source changed, we still update the channel to modify the last
    // updated time.
    const channelResponse = await this.channelsStore.save(project.channel);
    if (!channelResponse.ok) {
      this.saveInProgress = false;
      this.executeListeners(ProjectManagerEvent.SaveFail, channelResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return channelResponse;
    }
    this.lastChannel = JSON.stringify(project.channel);

    this.saveInProgress = false;
    this.executeListeners(ProjectManagerEvent.SaveSuccess);
    return new Response();
  }

  private canSave(forceSave: boolean): boolean {
    if (this.saveInProgress) {
      return false;
    } else if (forceSave) {
      // If this is a force save, don't wait until the next save time.
      return true;
    } else if (this.nextSaveTime) {
      return this.nextSaveTime <= Date.now();
    }

    return true;
  }

  private enqueueSave() {
    this.saveQueued = true;

    setTimeout(
      () => {
        this.save();
      },
      this.nextSaveTime ? this.nextSaveTime - Date.now() : this.saveInterval
    );
  }

  // Given a level id, get the channel id for that level and set it as the current channel.
  // This is private because it is only called from load(levelId). It could be made public
  // if we see a need to call it directly from a lab.
  private async setLevel(levelId: string, scriptName?: string) {
    const response = await this.channelsStore.loadForLevel(levelId, scriptName);
    if (response.ok) {
      const responseBody = await response.json();
      if (responseBody && responseBody.channel) {
        this.channelId = responseBody.channel;
      }
      return response;
    } else {
      return response;
    }
  }

  addEventListener(type: ProjectManagerEvent, listener: () => void) {
    if (this.eventListeners[type]) {
      this.eventListeners[type]?.push(listener);
    } else {
      this.eventListeners[type] = [listener];
    }
  }

  private executeListeners(
    type: ProjectManagerEvent,
    response: Response = new Response()
  ) {
    this.eventListeners[type]?.forEach(listener => listener(response));
  }

  private getNoChannelResponse() {
    return new Response('No channel id', {status: 404});
  }

  private getNoopResponse() {
    const noopResponse = new Response(null, {status: 304});
    this.executeListeners(ProjectManagerEvent.SaveNoop, noopResponse);
    return noopResponse;
  }

  private sourceChanged(project: Project): boolean {
    return this.lastSource !== JSON.stringify(project.source);
  }

  private channelChanged(project: Project): boolean {
    return this.lastChannel !== JSON.stringify(project.channel);
  }
}
