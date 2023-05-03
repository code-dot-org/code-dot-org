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
  channelId: string | undefined;
  sourcesStore: SourcesStore;
  channelsStore: ChannelsStore;

  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private eventListeners: {
    [key in keyof typeof ProjectManagerEvent]?: [(response: Response) => void];
  } = {};

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    channelId: string | undefined
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
  }

  async setLevel(levelId: string) {
    const response = await this.channelsStore.loadForLevel(levelId);
    if (response.ok) {
      const responseBody = await response.json();
      console.log(responseBody);
      if (responseBody && responseBody.channel) {
        this.channelId = responseBody.channel;
      }
    }
  }

  async load(levelId?: string): Promise<Response> {
    if (levelId) {
      await this.setLevel(levelId);
    }
    if (!this.channelId) {
      console.log("don't have channel id");
      return this.getNoChannelResponse();
    }
    const sourceResponse = await this.sourcesStore.load(this.channelId);
    // If sourceResponse is not ok, we still want to load the channel. Source can
    // return not found if the project is new.
    let source = {};
    if (sourceResponse.ok) {
      source = await sourceResponse.json();
    }

    const channelResponse = await this.channelsStore.load(this.channelId);
    if (!channelResponse.ok) {
      return channelResponse;
    }

    const channel = await channelResponse.json();
    const project = {source, channel};
    const blob = new Blob([JSON.stringify(project)], {
      type: 'application/json',
    });
    return new Response(blob);
  }

  hasQueuedSave(): boolean {
    return this.saveQueued;
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
  async save(getProject: () => Project, forceSave = false): Promise<Response> {
    if (!this.channelId) {
      return this.getNoChannelResponse();
    }
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        this.enqueueSave(getProject);
      }
      const noopResponse = new Response(null, {status: 304});
      this.executeListeners(ProjectManagerEvent.SaveNoop, noopResponse);
      return noopResponse;
    }

    this.saveInProgress = true;
    this.saveQueued = false;
    this.nextSaveTime = Date.now() + this.saveInterval;
    this.executeListeners(ProjectManagerEvent.SaveStart);
    const project = getProject();
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

  private enqueueSave(getProject: () => Project) {
    this.saveQueued = true;

    setTimeout(
      () => {
        this.save(getProject);
      },
      this.nextSaveTime ? this.nextSaveTime - Date.now() : this.saveInterval
    );
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
}
