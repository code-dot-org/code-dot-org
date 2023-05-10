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
  channelId: string;
  sourcesStore: SourcesStore;
  channelsStore: ChannelsStore;
  projectToSave: Project | undefined;

  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private eventListeners: {
    [key in keyof typeof ProjectManagerEvent]?: [(response: Response) => void];
  } = {};
  private lastSource: string | undefined;
  private lastChannel: string | undefined;
  // Id of the last timeout we set on a save, or undefined if there is no current timeout.
  // When we enqueue a save, we set a timeout to execute the save after the save interval.
  // If we force a save or destroy the ProjectManager, we clear the remaining timeout,
  // if it exists.
  private timeoutId: number | undefined;
  private destroyed = false;

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    channelId: string
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
    console.log(`[DEBUGGING] created project manager for ${channelId}`);
  }

  // Load the project from the sources and channels store.
  async load(): Promise<Response> {
    if (this.destroyed) {
      // no-op response
      return new Response(null, {status: 304});
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
    // If a save has not been queued, do not check for unsaved changes.
    // if (!this.saveQueued) {
    //   return false;
    // }
    return this.sourceChanged() || this.channelChanged();
  }

  // Shut down this project manager. All we do here is clear the existing
  // timeout, if it exists.
  destroy(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.destroyed = false;
    console.log(
      `[DEBUGGING] destroyed project manager with channel id ${this.channelId}`
    );
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
  async save(project: Project, forceSave = false) {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      console.log(
        `[DEBUGGING] tried to save on a destroyed project manager with channel id ${this.channelId}`
      );
      return this.getNoopResponse();
    }
    this.projectToSave = project;
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        this.enqueueSave();
      }
      return this.getNoopResponse();
    } else {
      this.saveHelper();
    }
  }

  private async saveHelper(): Promise<Response> {
    if (!this.projectToSave) {
      return this.getNoopResponse();
    }
    this.resetSaveState();
    this.saveInProgress = true;
    this.nextSaveTime = Date.now() + this.saveInterval;
    this.executeListeners(ProjectManagerEvent.SaveStart);
    const sourceChanged = this.sourceChanged();
    const channelChanged = this.channelChanged();
    // If neither source nor channel has actually changed, no need to save again.
    if (!sourceChanged && !channelChanged) {
      this.saveInProgress = false;
      return this.getNoopResponse();
    }
    // Only save the source if it has changed.
    if (sourceChanged) {
      console.log(
        `[DEBUGGING] saving for project with channel id ${
          this.channelId
        }, source is ${JSON.stringify(this.projectToSave.source)}`
      );
      const sourceResponse = await this.sourcesStore.save(
        this.channelId,
        this.projectToSave.source
      );
      if (!sourceResponse.ok) {
        this.saveInProgress = false;
        this.executeListeners(ProjectManagerEvent.SaveFail, sourceResponse);

        // TODO: Should we wrap this response in some way?
        // Maybe add a more specific statusText to the response?
        return sourceResponse;
      }
      this.lastSource = JSON.stringify(this.projectToSave.source);
    }

    // Always save the channel--either the channel has changed and/or the source changed.
    // Even if only the source changed, we still update the channel to modify the last
    // updated time.
    const channelResponse = await this.channelsStore.save(
      this.projectToSave.channel
    );
    if (!channelResponse.ok) {
      this.saveInProgress = false;
      this.executeListeners(ProjectManagerEvent.SaveFail, channelResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return channelResponse;
    }
    this.lastChannel = JSON.stringify(this.projectToSave.channel);

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

    this.timeoutId = window.setTimeout(
      () => {
        this.saveHelper();
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

  private getNoopResponse() {
    const noopResponse = new Response(null, {status: 304});
    this.executeListeners(ProjectManagerEvent.SaveNoop, noopResponse);
    return noopResponse;
  }

  private sourceChanged(): boolean {
    if (!this.projectToSave) {
      return false;
    }
    return this.lastSource !== JSON.stringify(this.projectToSave.source);
  }

  private channelChanged(): boolean {
    if (!this.projectToSave) {
      return false;
    }
    return this.lastChannel !== JSON.stringify(this.projectToSave.channel);
  }

  private resetSaveState(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.saveQueued = false;
  }
}
