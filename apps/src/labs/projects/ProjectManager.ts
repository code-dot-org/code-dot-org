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
import {NewProject, Project, Source} from '../types';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';

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
    [key in keyof typeof ProjectManagerEvent]?: [(payload: object) => void];
  } = {};
  private lastSource: string | undefined;
  private lastChannel: string | undefined;
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

  // Load the project from the sources and channels store. Throws if there are any errors.
  async load(): Promise<NewProject> {
    if (this.destroyed) {
      throw new Error('Project Manager destroyed');
    }

    let source: Source | undefined;
    try {
      const sourceResponse = await this.sourcesStore.load(this.channelId);
      const sourceString = sourceResponse.source;
      this.lastSource = sourceString;
      source = JSON.parse(sourceString);
    } catch (error) {
      // If sourceResponse is a 404 (not found), we still want to load the channel.
      // Source can return not found if the project is new. Throw if not a 404.
      if (!(error as Error).message.includes('404')) {
        throw error;
      }
    }

    const channel = await this.channelsStore.load(this.channelId);
    return {
      source,
      channel,
    };
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
   * @param project Project: the project to save
   * @param forceSave boolean: if the save should happen immediately
   * @returns a promise that resolves to a Response. If the save is successful, the response
   * will be empty, otherwise it will contain failure information.
   */
  async save(project: Project, forceSave = false): Promise<void> {
    if (this.destroyed) {
      // If we have already been destroyed, don't attempt to save.
      this.resetSaveState();
      this.sendSaveNoopEvent();
    }
    this.projectToSave = project;
    if (!this.canSave(forceSave)) {
      if (!this.saveQueued) {
        this.enqueueSave();
      }
      this.sendSaveNoopEvent();
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
  private async saveHelper(): Promise<void> {
    if (!this.projectToSave) {
      this.sendSaveNoopEvent();
      return;
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
      this.sendSaveNoopEvent();
      return;
    }
    // Only save the source if it has changed.
    if (sourceChanged) {
      try {
        await this.sourcesStore.save(this.channelId, this.projectToSave.source);
      } catch (error) {
        this.onSaveFail('Error saving sources', error as Error);
        return;
      }
      this.lastSource = JSON.stringify(this.projectToSave.source);
    }

    // Always save the channel--either the channel has changed and/or the source changed.
    // Even if only the source changed, we still update the channel to modify the last
    // updated time.
    let channelResponse;
    try {
      channelResponse = await this.channelsStore.save(
        this.projectToSave.channel
      );
    } catch (error) {
      this.onSaveFail('Error saving channel', error as Error);
      return;
    }
    this.lastChannel = JSON.stringify(this.projectToSave.channel);

    const channelSaveResponse = await channelResponse.json();

    this.saveInProgress = false;
    this.lastSaveResponse = channelSaveResponse;
    this.executeListeners(
      ProjectManagerEvent.SaveSuccess,
      this.lastSaveResponse
    );
  }

  private onSaveFail(errorMessage: string, error: Error) {
    this.saveInProgress = false;
    this.logError(errorMessage, error);
    this.executeListeners(ProjectManagerEvent.SaveFail, error);
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

  addEventListener(type: ProjectManagerEvent, listener: () => void) {
    if (this.eventListeners[type]) {
      this.eventListeners[type]?.push(listener);
    } else {
      this.eventListeners[type] = [listener];
    }
  }

  private executeListeners(type: ProjectManagerEvent, payload: object = {}) {
    this.eventListeners[type]?.forEach(listener => listener(payload));
  }

  private sendSaveNoopEvent() {
    this.executeListeners(ProjectManagerEvent.SaveNoop, this.lastSaveResponse);
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
    if (this.currentTimeoutId !== undefined) {
      window.clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = undefined;
    }
    this.saveQueued = false;
  }

  private logError(errorMessage: string, error: Error): void {
    MetricsReporter.logError({
      channelId: this.channelId,
      errorMessage,
      error: error.toString(),
    });
  }
}
