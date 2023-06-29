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
import {Channel, Project, ProjectSources} from '../types';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';

export default class ProjectManager {
  private readonly channelId: string;
  private readonly sourcesStore: SourcesStore;
  private readonly channelsStore: ChannelsStore;
  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private saveSuccessListeners: ((
    channel: Channel,
    sources: ProjectSources
  ) => void)[] = [];
  private saveNoopListeners: ((channel?: Channel) => void)[] = [];
  private saveFailListeners: ((response: Response) => void)[] = [];
  private saveStartListeners: (() => void)[] = [];
  // The last source we saved or loaded, or undefined if we have not saved a source yet.
  private lastSource: string | undefined;
  // The next source to save, or undefined if we have no source to save.
  private sourcesToSave: ProjectSources | undefined;
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
  private reduceChannelUpdates: boolean;
  private initialSaveComplete: boolean;

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    channelId: string,
    reduceChannelUpdates: boolean
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
    this.reduceChannelUpdates = reduceChannelUpdates;
    this.initialSaveComplete = false;
  }

  // Load the project from the sources and channels store.
  async load(): Promise<Project> {
    if (this.destroyed) {
      throw new Error('Project Manager destroyed');
    }
    let sources: ProjectSources | undefined;
    try {
      sources = await this.sourcesStore.load(this.channelId);
      this.lastSource = JSON.stringify(sources);
    } catch (error) {
      // If sourceResponse is a 404 (not found), we still want to load the channel.
      // Source can return not found if the project is new. Throw if not a 404.
      if (!(error as Error).message.includes('404')) {
        this.logError('Error loading sources', error as Error);
        throw error;
      }
    }

    let channel: Channel;
    try {
      channel = await this.channelsStore.load(this.channelId);
    } catch (error) {
      this.logError('Error loading channel', error as Error);
      throw error;
    }

    this.lastChannel = channel;
    return {sources, channel};
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
    if (this.sourcesToSave) {
      await this.save(this.sourcesToSave, true);
    }
    this.destroy();
  }

  /**
   * Enqueue a save to happen in the next saveInterval, unless a force save is requested.
   * If a save is already enqueued, update this.sourceToSave with the given source.
   * @param sources ProjectSources: the source to save.
   * @param forceSave boolean: if the save should happen immediately
   * @returns a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async save(sources?: ProjectSources, forceSave = false) {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    this.sourcesToSave = sources;
    return this.enqueueSaveOrSave(forceSave);
  }

  /**
   * Try to force save with the last sourcesToSave, if it exists.
   * This is used to flush out any remaining enqueued saves.
   * @returns  a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async flushSave() {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    return this.enqueueSaveOrSave(true);
  }

  async rename(name: string, forceSave = false) {
    if (this.destroyed || !this.lastChannel) {
      // If we have already been destroyed or the channel does not exist,
      // don't attempt to rename.
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    if (!this.channelToSave) {
      this.channelToSave = JSON.parse(
        JSON.stringify(this.lastChannel)
      ) as Channel;
    }
    this.channelToSave.name = name;
    return this.enqueueSaveOrSave(forceSave);
  }

  /**
   * Returns a share URL for the current project.
   *
   * Share URLs can vary by application environment and project type.  For most
   * project types the share URL is the same as the project edit and view URLs,
   * but has no action appended to the project's channel ID. Weblab is a special
   * case right now, because it shares projects to codeprojects.org.
   *
   * This function depends on the document location to determine the current
   * application environment.
   *
   * @returns {string} Fully-qualified share URL for the current project.
   */
  getShareUrl() {
    if (!this.lastChannel || !this.lastChannel.projectType) {
      return null;
    }
    const location = this.getLocation();
    // This will not work for web lab, but we will likely not move web lab to use ProjectManager.
    return (
      location.origin +
      '/projects/' +
      this.lastChannel.projectType +
      '/' +
      this.channelId
    );
  }

  addSaveSuccessListener(
    listener: (channel: Channel, sources: ProjectSources) => void
  ) {
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
    if (!this.sourcesToSave || !this.lastChannel) {
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
        this.sourcesToSave
      );
      if (!sourceResponse.ok) {
        this.saveInProgress = false;
        this.executeSaveFailListeners(sourceResponse);

        // TODO: Should we wrap this response in some way?
        // Maybe add a more specific statusText to the response?
        return sourceResponse;
      }
      this.lastSource = JSON.stringify(this.sourcesToSave);
    }

    // Normally, reduceChannelUpdates is false and we update the channel
    // metadata every time source code is saved. When in emergency mode,
    // reduceChannelUpdates is true for HoC levels and we only update
    // channel metadata on the initial save to reduce write pressure on
    // the database. The main user-visible effect of this is that the
    // project's 'last saved' time shown in the UI may be inaccurate for
    // all projects that were saved while emergency mode was active.

    if (!this.reduceChannelUpdates || !this.initialSaveComplete) {
      // As long as we are not in emergency mode, always save the channel,
      // as either the channel has changed and/or the source changed.
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
      this.lastChannel = channelSaveResponse as Channel;
    }

    this.saveInProgress = false;
    this.channelToSave = undefined;
    this.executeSaveSuccessListeners(this.lastChannel, this.sourcesToSave);
    this.initialSaveComplete = true;
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
    if (!this.sourcesToSave) {
      return false;
    }
    return this.lastSource !== JSON.stringify(this.sourcesToSave);
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
  private executeSaveSuccessListeners(
    channel: Channel,
    sources: ProjectSources
  ) {
    this.saveSuccessListeners.forEach(listener => listener(channel, sources));
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

  private logError(errorMessage: string, error: Error): void {
    MetricsReporter.logError({
      channelId: this.channelId,
      errorMessage,
      error: error.toString(),
    });
  }

  // Helpers
  /**
   * This method exists to be mocked for unit tests.
   */
  getLocation() {
    return document.location;
  }
}
