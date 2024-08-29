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
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {currentLocation} from '@cdo/apps/utils';

import LabMetricsReporter from '../Lab2MetricsReporter';
import Lab2Registry from '../Lab2Registry';
import {ValidationError} from '../responseValidators';
import {Channel, ProjectAndSources, ProjectSources} from '../types';

import {ChannelsStore} from './ChannelsStore';
import {SourcesStore} from './SourcesStore';

const {reload} = require('@cdo/apps/utils');

export default class ProjectManager {
  private readonly channelId: string;
  private readonly sourcesStore: SourcesStore;
  private readonly channelsStore: ChannelsStore;
  private readonly metricsReporter: LabMetricsReporter;
  private nextSaveTime: number | null = null;
  private readonly saveInterval: number = 30 * 1000; // 30 seconds
  private saveInProgress = false;
  private saveQueued = false;
  private saveSuccessListeners: ((channel: Channel) => void)[] = [];
  private saveNoopListeners: ((channel?: Channel) => void)[] = [];
  private saveFailListeners: ((error: Error) => void)[] = [];
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
  private forceReloading: boolean;

  constructor(
    sourcesStore: SourcesStore,
    channelsStore: ChannelsStore,
    channelId: string,
    reduceChannelUpdates: boolean,
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    this.channelId = channelId;
    this.sourcesStore = sourcesStore;
    this.channelsStore = channelsStore;
    this.reduceChannelUpdates = reduceChannelUpdates;
    this.initialSaveComplete = false;
    this.forceReloading = false;
    this.metricsReporter = metricsReporter;
  }

  getChannelId(): string {
    return this.channelId;
  }

  // Load the project from the sources and channels store.
  async load(): Promise<ProjectAndSources> {
    if (this.destroyed) {
      this.throwErrorIfDestroyed('load');
    }
    const sources = await this.loadAndStoreSources();

    let channel: Channel;
    try {
      channel = await this.channelsStore.load(this.channelId);
    } catch (error) {
      throw new Error('Error loading channel', {cause: error});
    }

    this.lastChannel = channel;
    return {sources, channel};
  }

  // Restore the given version of the project. This will call restore on the sources store
  // and then load and return the updated sources.
  async restoreSources(versionId: string): Promise<ProjectSources | undefined> {
    if (this.destroyed) {
      this.throwErrorIfDestroyed('restore');
    }
    // Flush the enqueued save, if it exists, before restoring.
    await this.flushSave();
    try {
      await this.sourcesStore.restore(this.channelId, versionId);
    } catch (e) {
      throw new Error('Error restoring sources', {cause: e});
    }
    // Now that we've restored to the previous version, loading sources
    // will load the newly-restored version.
    const sources = await this.loadAndStoreSources();
    return sources;
  }

  /**
   * Load the sources for this project. If a versionId is provided, load that version, otherwise
   * load the latest version. The sources are not stored by the Project Manager.
   * @param versionId Optional version id to load. If not provided, the latest version is loaded.
   * @returns sources for the project.
   */
  async loadSources(versionId?: string) {
    console.log(`loading version ${versionId}`);
    let sources: ProjectSources | undefined;
    try {
      sources = await this.sourcesStore.load(this.channelId, versionId);
    } catch (error) {
      // If there was a validation error or sourceResponse is a 404 (not found),
      // we still want to load the channel. In the case of a validation error,
      // we will default to empty sources. Source can return not found if the project
      // is new. If neither of these cases, throw the error.
      if (error instanceof ValidationError) {
        console.log('validation error');
        this.metricsReporter.logWarning(
          `Error validating sources (${error.message}). Defaulting to empty sources.`
        );
      } else if (
        error instanceof NetworkError &&
        (error as NetworkError).response.status === 404
      ) {
        console.log('got a 404');
        // This is expected if the project is new. Default to empty sources.
      } else {
        throw new Error('Error loading sources', {cause: error});
      }
    }
    console.log({sources});
    return sources;
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
  async save(sources: ProjectSources, forceSave = false) {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    this.sourcesToSave = sources;
    return await this.enqueueSaveOrSave(forceSave);
  }

  /**
   * Try to force save with the last sourcesToSave, if it exists.
   * This is used to flush out any remaining enqueued saves.
   * @returns a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async flushSave() {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      return this.getNoopResponseAndSendSaveNoopEvent();
    }
    return await this.enqueueSaveOrSave(true);
  }

  /**
   * Rename the current project. Default to saving immediately.
   * @param name new name for the project.
   * @param forceSave Whether or not to save immediately. Default to true, because
   * renames are done in response to a user action.
   * @returns a promise that resolves to a Response. If the rename is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async rename(name: string, forceSave = true) {
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
    return await this.enqueueSaveOrSave(forceSave);
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
    const location = currentLocation();
    // This will not work for web lab, but we will likely not move web lab to use ProjectManager.
    return (
      location.origin +
      '/projects/' +
      this.lastChannel.projectType +
      '/' +
      this.channelId
    );
  }

  redirectToRemix() {
    this.throwErrorIfDestroyed('redirectToRemix');
    if (!this.lastChannel || !this.lastChannel.projectType) {
      this.logAndThrowError('Cannot remix without channel');
      return;
    }
    this.channelsStore.redirectToRemix(this.lastChannel);
  }

  redirectToView() {
    this.throwErrorIfDestroyed('redirectToView');
    if (!this.lastChannel || !this.lastChannel.projectType) {
      this.logAndThrowError('Cannot view without channel');
      return;
    }
    this.channelsStore.redirectToView(this.lastChannel);
  }

  /**
   * Publish the current channel.
   */
  publish() {
    this.publishHelper(true);
  }

  /**
   * Unpublish the current channel.
   */
  unpublish() {
    this.publishHelper(false);
  }

  async getVersionList() {
    return await this.sourcesStore.getVersionList(this.channelId);
  }

  addSaveSuccessListener(listener: (channel: Channel) => void) {
    this.saveSuccessListeners.push(listener);
  }

  addSaveNoopListener(listener: (channel?: Channel) => void) {
    this.saveNoopListeners.push(listener);
  }

  addSaveFailListener(listener: (error: Error) => void) {
    this.saveFailListeners.push(listener);
  }

  addSaveStartListener(listener: () => void) {
    this.saveStartListeners.push(listener);
  }

  isForceReloading(): boolean {
    return this.forceReloading;
  }

  /**
   * Helper function to save a project, called either after a timeout or directly by save().
   * On a save, we check if there are unsaved changes to the source or channel.
   * If there are none, we can skip the save. If only the channel changed, we can
   * skip saving the source.
   * Only if the source save succeeds do we update the channel, as the
   * channel is metadata about the project and we don't want to save it unless the source
   * save succeeded.
   * @returns a Promise<void> that resolves when the save is complete or when the save fails.
   * Listeners are notified of save status throughout the process.
   */
  private async saveHelper(): Promise<void> {
    // We can't save without a last channel or last source.
    // We also know we don't need to save if we don't have sources to save
    // or a channel to save.
    // We also cannot save if the user is not the owner of this project.
    if (
      !this.lastChannel ||
      !this.lastChannel.isOwner ||
      !(this.sourcesToSave || this.channelToSave)
    ) {
      this.executeSaveNoopListeners(this.lastChannel);
      return;
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
      // We can clear sourcesToSave since they have not changed.
      this.sourcesToSave = undefined;
      this.executeSaveNoopListeners(this.lastChannel);
      return;
    }
    // Only save the source if it has changed.
    if (this.sourcesToSave && sourceChanged) {
      try {
        await this.sourcesStore.save(
          this.channelId,
          this.sourcesToSave,
          this.lastChannel.projectType
        );
      } catch (error) {
        this.onSaveFail('Error saving sources', error as Error);
        return;
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

      // If the sources contain a labConfig entry, then also save this to the
      // channel, which means that the labConfig entry will also be saved in the
      // Project model in the database, specifically inside the value field JSON.
      if (this.sourcesToSave?.labConfig) {
        this.channelToSave = {
          ...this.channelToSave,
          labConfig: this.sourcesToSave?.labConfig,
        };
      }

      let channelResponse;
      try {
        channelResponse = await this.channelsStore.save(this.channelToSave);
      } catch (error) {
        this.onSaveFail('Error saving channel', error as Error);
        return;
      }
      const channelSaveResponse = await channelResponse.json();
      this.lastChannel = channelSaveResponse as Channel;
    }

    this.saveInProgress = false;
    this.channelToSave = undefined;
    this.sourcesToSave = undefined;
    this.executeSaveSuccessListeners(this.lastChannel);
    this.initialSaveComplete = true;
  }

  private onSaveFail(errorMessage: string, error: Error) {
    this.saveInProgress = false;
    this.executeSaveFailListeners(error);
    if (error.message.includes('409') || error.message.includes('401')) {
      // If this is a conflict or the user has somehow become unauthorized,
      // we need to reload the page.
      // We set forceReloading to true so the client can skip
      // showing the user a dialog before reload.
      this.forceReloading = true;
      this.metricsReporter.logWarning(`${error.message}. Reloading page.`);
      reload();
    } else {
      // Otherwise, we log the error.
      this.metricsReporter.logError(errorMessage, error);
    }
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
  private async enqueueSaveOrSave(forceSave: boolean) {
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
      // request.
      return await this.saveHelper();
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

  private throwErrorIfDestroyed(actionName: string) {
    if (this.destroyed) {
      this.logAndThrowError(
        `Tried to ${actionName}, but the Project Manager was destroyed.`
      );
    }
  }

  private logAndThrowError(errorMessage: string) {
    const error = new Error(errorMessage);
    this.metricsReporter.logError(errorMessage, error);
    throw error;
  }

  /**
   * Helper for publish and unpublish methods, since they are so similar.
   * Either publishes or unpublishes lastChannel, depending on the publish parameter.
   * If this ProjectManager has been destroyed, or we're missing a channel, this method
   * will throw an error.
   * @param publish true if we should publish, false is we should unpublish
   * @returns a Promise that resolves when the publish/unpublish is complete
   */
  private async publishHelper(publish: boolean) {
    const actionType = publish ? 'publish' : 'unpublish';
    this.throwErrorIfDestroyed(actionType);
    if (!this.lastChannel || !this.lastChannel.projectType) {
      this.logAndThrowError(`Cannot ${actionType} without channel`);
      return;
    }
    if (publish) {
      return this.channelsStore.publish(this.lastChannel);
    } else {
      return this.channelsStore.unpublish(this.lastChannel);
    }
  }

  /**
   * Load the sources for the given version id, or the latest version if no version id is provided.
   * These sources are stored as lastSource, so any future changes to the sources will be compared
   * to these sources.
   * @param versionId Optional version id to load. If not provided, the latest version is loaded.
   * @returns sources for the project.
   */
  private async loadAndStoreSources(versionId?: string) {
    const sources = await this.loadSources(versionId);
    this.lastSource = JSON.stringify(sources);
    return sources;
  }

  // LISTENERS
  private executeSaveSuccessListeners(channel: Channel) {
    this.saveSuccessListeners.forEach(listener => listener(channel));
  }

  private executeSaveNoopListeners(channel?: Channel) {
    this.saveNoopListeners.forEach(listener => listener(channel));
  }

  private executeSaveFailListeners(error: Error) {
    this.saveFailListeners.forEach(listener => listener(error));
  }

  private executeSaveStartListeners() {
    this.saveStartListeners.forEach(listener => listener());
  }
}
