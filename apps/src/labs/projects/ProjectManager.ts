/**
 * ProjectManager manages loading and saving projects that have a source
 * and channel component, and are indexed on a channel id (or other unique identifier).
 * It accepts a sources and channels store, which handle communication with the relevant
 * apis for loading and saving sources and channels.
 *
 * ProjectManager throttles saves to only occur once every 30 seconds, unless a force
 * save is requested. If save is called within 30 seconds of the previous save,
 * the save is queued and will be executed after the 30 second interval has passed.
 *
 * If a project manager is destroyed, the enqueued save will be cancelled, if it exists.
 */
import {SourcesStore} from './SourcesStore';
import {ChannelsStore} from './ChannelsStore';
import {Channel, Source} from '../types';

export default class ProjectManager {
  channelId: string;
  sourcesStore: SourcesStore;
  channelsStore: ChannelsStore;
  sourceToSave: Source | undefined;

  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private saveSuccessListeners: ((channel: Channel) => void)[] = [];
  private saveNoopListeners: ((channel?: Channel) => void)[] = [];
  private saveFailListeners: ((response: Response) => void)[] = [];
  private saveStartListeners: (() => void)[] = [];
  private lastSource: string | undefined;
  private channel: Channel | undefined;
  // Id of the last timeout we set on a save, or undefined if there is no current timeout.
  // When we enqueue a save, we set a timeout to execute the save after the save interval.
  // If we force a save or destroy the ProjectManager, we clear the remaining timeout,
  // if it exists.
  private currentTimeoutId: number | undefined;
  private destroyed = false;
  private lastSaveResponse: object | undefined;

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    channelId: string
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
  }

  // Load the project from the sources and channels store.
  async load(): Promise<Response> {
    if (this.destroyed) {
      return this.getNoopResponse();
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

    this.channel = await channelResponse.json();
    const channelString = JSON.stringify(this.channel);
    const project = {source, channel: channelString};
    const blob = new Blob([JSON.stringify(project)], {
      type: 'application/json',
    });
    return new Response(blob);
  }

  hasUnsavedChanges(): boolean {
    return this.sourceChanged() || this.channelChanged();
  }

  // Shut down this project manager. All we do here is clear the existing
  // timeout, if it exists.
  destroy(): void {
    this.resetSaveState();
    this.destroyed = true;
  }

  // TODO: Add functionality to reduce channel updates during
  // HoC "emergency mode" (see 1182-1187 in project.js).
  /**
   * Enqueue a save to happen in the next saveInterval, unless a force save is requested.
   * If a save is already enqueued, update this.projectToSave with the given project.
   * @param source Source: the project to save
   * @param forceSave boolean: if the save should happen immediately
   * @returns a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async save(source: Source, forceSave = false) {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    this.sourceToSave = source;
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        this.enqueueSave();
      }
      return this.getNoopResponseAndSendSaveNoopEvent();
    } else {
      this.saveHelper();
    }
  }

  /**
   * Helper function to save a project, called either after a timeout or directly by save()
   * On a save, we check if there are unsaved changes. If there are none, we can skip the save.
   * If only the source has changed, we save both the source and channel, as we want to update the
   * lastUpdatedTime on the channel. If only the channel has changed, we skip saving the source and only
   * save the channel.
   * If we are saving both source and channel, only if the source save succeeds do we update the channel, as the
   * channel is metadata about the project and we don't want to save it unless the source
   * save succeeded.
   * @returns a Response. If the save is successful, the response will be empty,
   * otherwise it will contain failure or no-op information.
   */
  private async saveHelper(): Promise<Response> {
    if (!this.sourceToSave || !this.channel) {
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    this.resetSaveState();
    this.saveInProgress = true;
    this.nextSaveTime = Date.now() + this.saveInterval;
    this.executeSaveStartListeners();
    const sourceChanged = this.sourceChanged();
    const channelChanged = this.channelChanged();
    // If neither source nor channel has actually changed, no need to save again.
    if (!sourceChanged && !channelChanged) {
      this.saveInProgress = false;
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    // Only save the source if it has changed.
    if (sourceChanged) {
      const sourceResponse = await this.sourcesStore.save(
        this.channelId,
        this.sourceToSave
      );
      if (!sourceResponse.ok) {
        this.saveInProgress = false;
        this.executeSaveFailListeners(sourceResponse);

        // TODO: Should we wrap this response in some way?
        // Maybe add a more specific statusText to the response?
        return sourceResponse;
      }
      this.lastSource = JSON.stringify(this.sourceToSave);
    }

    // Always save the channel--either the channel has changed and/or the source changed.
    // Even if only the source changed, we still update the channel to modify the last
    // updated time.
    const channelResponse = await this.channelsStore.save(this.channel);
    if (!channelResponse.ok) {
      this.saveInProgress = false;
      this.executeSaveFailListeners(channelResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return channelResponse;
    }

    const channelSaveResponse = await channelResponse.json();

    this.saveInProgress = false;
    this.lastSaveResponse = channelSaveResponse;
    this.channel = channelSaveResponse as Channel;
    this.executeSaveSuccessListeners(this.channel);
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

    this.currentTimeoutId = window.setTimeout(
      () => {
        this.saveHelper();
      },
      this.nextSaveTime ? this.nextSaveTime - Date.now() : this.saveInterval
    );
  }

  // On save success, listeners may want to know the updated channel,
  // so we have a specific listener for that.
  addSaveSuccessListener(listener: (channel: Channel) => void) {
    this.saveSuccessListeners.push(listener);
  }

  addSaveNoopListener(listener: (channel?: Channel) => void) {
    this.saveNoopListeners.push(listener);
  }

  addSaveFailListener(listener: (response: Response) => void) {
    this.saveFailListeners.push(listener);
  }

  addSaveStartListener(listener: () => void) {
    this.saveStartListeners.push(listener);
  }

  private executeSaveSuccessListeners(channel: Channel) {
    this.saveSuccessListeners.forEach(listener => listener(channel));
  }

  private executeSaveNoopListeners(channel?: Channel) {
    this.saveNoopListeners.forEach(listener => listener(channel));
  }

  private executeSaveFailListeners(response: Response) {
    this.saveFailListeners.forEach(listener => listener(response));
  }

  private executeSaveStartListeners() {
    this.saveStartListeners.forEach(listener => listener());
  }

  private getNoopResponse() {
    return new Response(null, {status: 304});
  }

  private getNoopResponseAndSendSaveNoopEvent() {
    const noopResponse = this.getNoopResponse();
    this.executeSaveNoopListeners(this.channel);
    return noopResponse;
  }

  private sourceChanged(): boolean {
    if (!this.sourceToSave) {
      return false;
    }
    return this.lastSource !== JSON.stringify(this.sourceToSave);
  }

  private channelChanged(): boolean {
    return false;
  }

  private resetSaveState(): void {
    if (this.currentTimeoutId !== undefined) {
      window.clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = undefined;
    }
    this.saveQueued = false;
  }
}
