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
import _ from 'lodash';

export default class ProjectManager {
  private readonly channelId: string;
  private readonly sourcesStore: SourcesStore;
  private readonly channelsStore: ChannelsStore;
  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private saveSuccessListeners: ((channel: Channel, source: Source) => void)[] =
    [];
  private saveNoopListeners: ((channel?: Channel) => void)[] = [];
  private saveFailListeners: ((response: Response) => void)[] = [];
  private saveStartListeners: (() => void)[] = [];
  // The last source we saved or loaded, or undefined if we have not saved a source yet.
  private lastSource: string | undefined;
  // The next source to save, or undefined if we have no source to save.
  private sourceToSave: Source | undefined;
  // The last channel we saved or loaded, or undefined if we have not saved a channel yet.
  private lastChannel: Channel | undefined;
  // The next channel to save, or undefined if we have no channel to save.
  private channelToSave: Channel | undefined;
  // Id of the last timeout we set on a save, or undefined if there is no current timeout.
  // When we enqueue a save, we set a timeout to execute the save after the save interval.
  // If we force a save or destroy the ProjectManager, we clear the remaining timeout,
  // if it exists.
  private currentTimeoutId: number | undefined;
  private destroyed = false;

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

    this.lastChannel = await channelResponse.json();
    const channelString = JSON.stringify(this.lastChannel);
    const project = {source, channel: channelString};
    const blob = new Blob([JSON.stringify(project)], {
      type: 'application/json',
    });
    return new Response(blob);
  }

  hasUnsavedChanges(): boolean {
    return this.sourceChanged();
  }

  // Shut down this project manager. All we do here is clear the existing
  // timeout, if it exists.
  destroy(): void {
    this.resetSaveState();
    this.destroyed = true;
  }

  // Save any enqueued unsaved changes, then destroy the project manager.
  async cleanUp() {
    if (this.sourceToSave) {
      await this.save(this.sourceToSave, true);
    }
    this.destroy();
  }

  // TODO: Add functionality to reduce channel updates during
  // HoC "emergency mode" (see 1182-1187 in project.js).
  /**
   * Enqueue a save to happen in the next saveInterval, unless a force save is requested.
   * If a save is already enqueued, update this.sourceToSave with the given source.
   * @param source Source: the source to save
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
    return this.enqueueSaveOrSave(forceSave);
  }

  async rename(name: string, forceSave = false) {
    if (this.destroyed || !this.lastChannel) {
      // If we have already been destroyed or the channel does not exist,
      // don't attempt to rename.
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    if (!this.channelToSave) {
      this.channelToSave = _.cloneDeep(this.lastChannel);
    }
    this.channelToSave.name = name;
    return this.enqueueSaveOrSave(forceSave);
  }

  addSaveSuccessListener(listener: (channel: Channel, source: Source) => void) {
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

  // TODO: Add rename function. Rename sets the name on the channel.
  // https://codedotorg.atlassian.net/browse/SL-891

  /**
   * Helper function to save a project, called either after a timeout or directly by save().
   * On a save, we check if there are unsaved changes to the source or channel.
   * If there are none, we can skip the save. If only the channel changed, we can
   * skip saving the source.
   * Only if the source save succeeds do we update the channel, as the
   * channel is metadata about the project and we don't want to save it unless the source
   * save succeeded.
   * @returns a Response. If the save is successful, the response will be empty,
   * otherwise it will contain failure or no-op information.
   */
  private async saveHelper(): Promise<Response> {
    if (!this.sourceToSave || !this.lastChannel) {
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
    this.channelToSave ||= this.lastChannel;
    const channelResponse = await this.channelsStore.save(this.channelToSave);
    if (!channelResponse.ok) {
      this.saveInProgress = false;
      this.executeSaveFailListeners(channelResponse);

      // TODO: Should we wrap this response in some way?
      // Maybe add a more specific statusText to the response?
      return channelResponse;
    }

    const channelSaveResponse = await channelResponse.json();

    this.saveInProgress = false;
    this.lastChannel = channelSaveResponse as Channel;
    this.channelToSave = undefined;
    this.executeSaveSuccessListeners(this.lastChannel, this.sourceToSave);
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

  // Check if we can save immediately. If a save is in progress, we must wait. Otherwise,
  // if forceSave is true or it has been at least 30 seconds since our last save,
  // initiate a save.
  // If we cannot save now, enqueue a save if one has not already been enqueued and
  // return a noop response.
  private enqueueSaveOrSave(forceSave: boolean) {
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        // enqueue a save
        this.saveQueued = true;
        this.currentTimeoutId = window.setTimeout(
          () => {
            this.saveHelper();
          },
          this.nextSaveTime ? this.nextSaveTime - Date.now() : this.saveInterval
        );
      }
      return this.getNoopResponseAndSendSaveNoopEvent();
    } else {
      // if we can save immediately, initiate a save now. This is an async
      // request that we do not wait for.
      this.saveHelper();
    }
  }

  private getNoopResponse() {
    return new Response(null, {status: 304});
  }

  private getNoopResponseAndSendSaveNoopEvent() {
    const noopResponse = this.getNoopResponse();
    this.executeSaveNoopListeners(this.lastChannel);
    return noopResponse;
  }

  private sourceChanged(): boolean {
    if (!this.sourceToSave) {
      return false;
    }
    return this.lastSource !== JSON.stringify(this.sourceToSave);
  }

  private channelChanged(): boolean {
    // If we don't have a channel to save or a last channel, we can't compare.
    // It isn't possible to have a channelToSave without a lastChannel,
    // as we create channelToSave from lastChannel.
    if (!this.channelToSave || !this.lastChannel) {
      return false;
    }
    return (
      JSON.stringify(this.lastChannel) !== JSON.stringify(this.channelToSave)
    );
  }

  private resetSaveState(): void {
    if (this.currentTimeoutId !== undefined) {
      window.clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = undefined;
    }
    this.saveQueued = false;
  }

  // LISTENERS
  private executeSaveSuccessListeners(channel: Channel, source: Source) {
    this.saveSuccessListeners.forEach(listener => listener(channel, source));
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
}
