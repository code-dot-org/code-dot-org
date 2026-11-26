import {expect, assert} from 'chai'; // eslint-disable-line no-restricted-imports
import sinon, {stubObject, StubbedInstance} from 'ts-sinon';

import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {ChannelsStore} from '@cdo/apps/lab2/projects/ChannelsStore';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {SourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import {ValidationError} from '@cdo/apps/lab2/responseValidators';
import {ProjectSources, Channel, ShareFailure} from '@cdo/apps/lab2/types';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const FAKE_CHANNEL_ID = 'fakeChannelId';

const FAKE_SOURCE: ProjectSources = {
  source: 'fakeSource',
};

const FAKE_MODIFIED_SOURCE: ProjectSources = {
  source: 'fakeModifiedSource',
};

const FAKE_CHANNEL: Channel = {
  id: '123',
  name: 'fakeChannel',
  isOwner: true,
  projectType: 'music',
  publishedAt: null,
  createdAt: 'fakeDate',
  updatedAt: 'fakeDate',
};

const UPDATED_SOURCE = {
  source: 'new source!',
};
const UPDATED_SOURCE_2 = {
  source: 'new source2!',
};

describe('ProjectManager', () => {
  let sourcesStore: StubbedInstance<SourcesStore>;
  let channelsStore: StubbedInstance<ChannelsStore>;

  beforeEach(() => {
    sourcesStore = stubObject<SourcesStore>(new SourcesStore('pythonlab'));
    // A fresh Response per call, since a Response body can only be read once.
    sourcesStore.save.callsFake(() => Promise.resolve(new Response('')));
    channelsStore = stubObject<ChannelsStore>(new ChannelsStore());
    channelsStore.load.returns(Promise.resolve(FAKE_CHANNEL));
    channelsStore.save.callsFake(() =>
      Promise.resolve(new Response(JSON.stringify(FAKE_CHANNEL)))
    );
  });

  it('returns sources and channel on load', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    const {sources, channel} = await projectManager.load();
    expect(sources).to.deep.equal(FAKE_SOURCE);
    expect(channel).to.deep.equal(FAKE_CHANNEL);
  });

  it('remixes once the save lands', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE, true);
    await projectManager.saveAndRemix();
    assert.isTrue(channelsStore.redirectToRemix.calledOnce);
  });

  it('does not remix when the save before it fails', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    sourcesStore.save.callsFake(() => Promise.reject(new Error('500')));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE, true);
    let thrown: unknown;
    try {
      await projectManager.saveAndRemix();
    } catch (error) {
      thrown = error;
    }
    assert.isDefined(thrown);
    assert.isTrue(channelsStore.redirectToRemix.notCalled);
  });

  it('fetches the share failure for share-filtered project types', async () => {
    const sketchlabChannel: Channel = {
      ...FAKE_CHANNEL,
      projectType: 'sketchlab',
    };
    const failure: ShareFailure = {type: 'profanity'};
    channelsStore.load.returns(Promise.resolve(sketchlabChannel));
    channelsStore.getShareFailure.returns(Promise.resolve(failure));
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    const {shareFailure} = await projectManager.load();
    expect(shareFailure).to.deep.equal(failure);
  });

  it('does not check the share failure for non-filtered project types', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    // FAKE_CHANNEL is a music project, which is not share-filtered.
    const {shareFailure} = await projectManager.load();
    assert.isNull(shareFailure);
    assert.isTrue(channelsStore.getShareFailure.notCalled);
  });

  it('defaults to no share failure if the check fails', async () => {
    const sketchlabChannel: Channel = {
      ...FAKE_CHANNEL,
      projectType: 'sketchlab',
    };
    channelsStore.load.returns(Promise.resolve(sketchlabChannel));
    channelsStore.getShareFailure.throws(new Error('network error'));
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    const {shareFailure} = await projectManager.load();
    assert.isNull(shareFailure);
  });

  it('triggers save immediately on first save', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('does not trigger a save if source has not changed', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(FAKE_SOURCE);
    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.notCalled);
  });

  it('does not trigger another save if we already saved during the last save interval', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);
    // We should only trigger a save once. The next save is enqueued
    // to happen in the next save interval.
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);

    // The queued save is still pending; clear its timeout.
    projectManager.destroy();
  });

  it('always triggers a save on force save', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2, true);
    // We should trigger a save twice; the first time is the initial save,
    // the second time because we forced a save.
    assert.isTrue(sourcesStore.save.calledTwice);
    assert.isTrue(channelsStore.save.calledTwice);
  });

  it('does not trigger save if destroyed', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    projectManager.destroy();
    await projectManager.save(UPDATED_SOURCE);

    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.notCalled);
  });

  it('skips second channel update in emergency mode', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: true /* turn emergency mode on */,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    // call second save with force save so that we save immediately
    await projectManager.save(UPDATED_SOURCE_2, true);

    // We should trigger a source save twice, but a channel save once.
    // We only save the first channel update in emergency mode.
    assert.isTrue(sourcesStore.save.calledTwice);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('triggers save noop event if save called before load', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    const noopListener = sinon.stub();
    projectManager.addSaveNoopListener(noopListener);
    projectManager.save(UPDATED_SOURCE);
    assert.isTrue(noopListener.calledOnce);
  });

  it('only triggers a channel save on rename', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.rename('new name');
    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('can still save if initial load returned a 404', async () => {
    const networkError: NetworkError = new NetworkError(
      'network error',
      new Response(null, {status: 404})
    );
    sourcesStore.load.throws(networkError);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);

    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('can still load a channel if sources fail validation', async () => {
    sourcesStore.load.throws(new ValidationError('JSON error'));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    const {channel, sources} = await projectManager.load();

    assert.isUndefined(sources);
    assert.deepEqual(channel, FAKE_CHANNEL);
  });

  it('throw an error if loading sources fails for any other reason', async () => {
    const networkError: NetworkError = new NetworkError(
      'network error',
      new Response(null, {status: 500})
    );
    sourcesStore.load.throws(networkError);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    try {
      await projectManager.load();
    } catch (e) {
      assert.deepEqual((e as Error).cause, networkError);
    }
  });

  it('does not trigger a save if the user is not the owner', async () => {
    const readonlyChannel = {...FAKE_CHANNEL, isOwner: false};
    channelsStore.load.returns(Promise.resolve(readonlyChannel));
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.notCalled);
  });

  it('Does not save on clean up after restore', async () => {
    // First load will be "original" code, second will be the versioned we restored.
    sourcesStore.load.onCall(0).returns(Promise.resolve(FAKE_SOURCE));
    sourcesStore.load.onCall(1).returns(Promise.resolve(FAKE_MODIFIED_SOURCE));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    // Load the initial sources
    const {sources} = await projectManager.load();
    expect(sources).to.deep.equal(FAKE_SOURCE);

    // Save called with same initial sources; will not trigger a save because
    // sources have not changed.
    await projectManager.save(FAKE_SOURCE);
    assert.isTrue(sourcesStore.save.notCalled);

    // Restore a previous version.
    const versionedSources = await projectManager.restoreSources(
      'fakeVersionId'
    );
    expect(versionedSources).to.deep.equal(FAKE_MODIFIED_SOURCE);
    assert.isTrue(sourcesStore.restore.calledOnce);

    // Call clean up; save should not be called.
    await projectManager.cleanUp();
    assert.isTrue(sourcesStore.save.notCalled);
  });

  it('Flushes save before restore', async () => {
    // First load will be "original" code, second will be the versioned we restored.
    sourcesStore.load.onCall(0).returns(Promise.resolve(FAKE_SOURCE));
    sourcesStore.load.onCall(1).returns(Promise.resolve(FAKE_MODIFIED_SOURCE));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    // Load the initial sources
    const {sources} = await projectManager.load();
    expect(sources).to.deep.equal(FAKE_SOURCE);
    projectManager.save(UPDATED_SOURCE);
    const versionedSources = await projectManager.restoreSources(
      'fakeVersionId'
    );
    expect(versionedSources).to.deep.equal(FAKE_MODIFIED_SOURCE);
    assert.isTrue(sourcesStore.restore.calledOnce);
    assert.isTrue(sourcesStore.save.calledOnce);
  });

  it('correctly forces a new version when forceNewVersion is true', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE, false, true);
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(
      sourcesStore.save.calledWith(
        FAKE_CHANNEL_ID,
        UPDATED_SOURCE,
        FAKE_CHANNEL.projectType,
        /* forceNewVersion */ true
      )
    );
  });

  it('does not force a new version when forceNewVersion is not provided', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(
      sourcesStore.save.calledWith(
        FAKE_CHANNEL_ID,
        UPDATED_SOURCE,
        FAKE_CHANNEL.projectType,
        /* forceNewVersion */ false
      )
    );
  });

  it('forces a new version when current version has a comment', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    // Mock getCurrentVersionId to return a version ID
    sourcesStore.getCurrentVersionId.returns('version123');
    // Mock getVersionList to return a version with a comment
    sourcesStore.getVersionList.returns(
      Promise.resolve([
        {
          versionId: 'version123',
          lastModified: '2023-01-01T00:00:00Z',
          isLatest: true,
          comment: 'This is a test comment',
        },
      ])
    );

    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);

    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(
      sourcesStore.save.calledWith(
        FAKE_CHANNEL_ID,
        UPDATED_SOURCE,
        FAKE_CHANNEL.projectType,
        /* forceNewVersion */ true
      )
    );
  });

  it('does not force a new version when current version has no comment', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    // Mock getCurrentVersionId to return a version ID
    sourcesStore.getCurrentVersionId.returns('version123');
    // Mock getVersionList to return a version without a comment
    sourcesStore.getVersionList.returns(
      Promise.resolve([
        {
          versionId: 'version123',
          lastModified: '2023-01-01T00:00:00Z',
          isLatest: true,
        },
      ])
    );

    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);

    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(
      sourcesStore.save.calledWith(
        FAKE_CHANNEL_ID,
        UPDATED_SOURCE,
        FAKE_CHANNEL.projectType,
        /* forceNewVersion */ false
      )
    );
  });

  it('resets current version comment state after creating autosave version', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    // Mock getCurrentVersionId to return a version ID
    sourcesStore.getCurrentVersionId.returns('version123');
    // Mock getVersionList to return a version with a comment
    sourcesStore.getVersionList.returns(
      Promise.resolve([
        {
          versionId: 'version123',
          lastModified: '2023-01-01T00:00:00Z',
          isLatest: true,
          comment: 'This is a test comment',
        },
      ])
    );

    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    // Verify initial comment state is set correctly
    assert.isTrue(projectManager.getForceNewVersion());

    // First save should force new version due to comment (autosave)
    await projectManager.save(UPDATED_SOURCE);

    // After autosave, comment state should be reset since new version was created
    assert.isFalse(projectManager.getForceNewVersion());

    // Second save should not force new version (comment state reset)
    await projectManager.save(UPDATED_SOURCE_2);
    assert.isFalse(projectManager.getForceNewVersion());

    // The queued save is still pending; clear its timeout.
    projectManager.destroy();
  });

  it('flushSave waits for the save in flight, then saves the changes made during it', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    // This save suspends inside sourcesStore.save.
    const firstSave = projectManager.save(UPDATED_SOURCE);
    // Edited while that save is in flight, so this one is only enqueued.
    await projectManager.save(UPDATED_SOURCE_2);
    assert.isTrue(sourcesStore.save.calledOnce);

    let flushed = false;
    const flush = projectManager.flushSave().then(() => {
      flushed = true;
    });
    await drainMicrotasks();
    assert.isFalse(
      flushed,
      'flush resolved before the save in flight finished'
    );

    finishFirstSourceSave();
    await firstSave;
    await flush;

    assert.isTrue(sourcesStore.save.calledTwice);
    expect(sourcesStore.save.secondCall.args[1]).to.deep.equal(
      UPDATED_SOURCE_2
    );
    assert.isFalse(projectManager.hasUnsavedChanges());
  });

  it('flushSave waits for the save in flight even when nothing else changed', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    let flushed = false;
    const flush = projectManager.flushSave().then(() => {
      flushed = true;
    });
    await drainMicrotasks();
    assert.isFalse(
      flushed,
      'flush resolved before the save in flight finished'
    );

    finishFirstSourceSave();
    await firstSave;
    await flush;

    // Nothing changed while the first save ran, so there is nothing to save.
    assert.isTrue(sourcesStore.save.calledOnce);
  });

  it('saves the pending changes once when two flushes overlap', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);
    const flushes = Promise.all([
      projectManager.flushSave(),
      projectManager.flushSave(),
    ]);
    finishFirstSourceSave();
    await firstSave;
    await flushes;

    // The first save plus one save of the pending change: the second flush finds
    // nothing left to write.
    assert.isTrue(sourcesStore.save.calledTwice);
    expect(sourcesStore.save.secondCall.args[1]).to.deep.equal(
      UPDATED_SOURCE_2
    );
    assert.isFalse(projectManager.hasUnsavedChanges());
  });

  it('does not report a noop when an edit arrives during a save in flight', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    const noopListener = sinon.stub();
    const startListener = sinon.stub();
    projectManager.addSaveNoopListener(noopListener);
    projectManager.addSaveStartListener(startListener);
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);

    // The first save is still running and the edit is queued behind it, so the
    // project is not up to date and listeners must not hear otherwise.
    assert.isTrue(startListener.calledOnce);
    assert.isTrue(noopListener.notCalled);

    finishFirstSourceSave();
    await firstSave;

    // The queued save is still pending; clear its timeout.
    projectManager.destroy();
  });

  it('keeps sources edited during a save in flight for the next save', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);
    finishFirstSourceSave();
    await firstSave;

    // Only the first source reached the store, so the second is still unsaved.
    expect(sourcesStore.save.firstCall.args[1]).to.deep.equal(UPDATED_SOURCE);
    assert.isTrue(projectManager.hasUnsavedChanges());

    // The queued save is still pending; clear its timeout.
    projectManager.destroy();
  });

  it('keeps a rename made during a save in flight', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    const rename = projectManager.rename('new name');
    finishFirstSourceSave();
    await firstSave;
    await rename;

    assert.isTrue(channelsStore.save.calledTwice);
    const renamedChannel = channelsStore.save.secondCall.args[0] as Channel;
    expect(renamedChannel.name).to.equal('new name');
  });

  it('does not revert channel fields the save in flight added', async () => {
    const sourcesWithLabConfig: ProjectSources = {
      source: 'fakeSource2',
      labConfig: {music: {packId: 'fakePack'}},
    };
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    // Echo the saved channel back, as the projects API does, so the labConfig the
    // first save writes shows up in the channel the second save builds on.
    channelsStore.save.callsFake(channel =>
      Promise.resolve(new Response(JSON.stringify(channel)))
    );
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    // This save carries the labConfig into the channel.
    const firstSave = projectManager.save(sourcesWithLabConfig);
    // The rename is made against the channel as it was before that save.
    const rename = projectManager.rename('new name');
    finishFirstSourceSave();
    await firstSave;
    await rename;

    assert.isTrue(channelsStore.save.calledTwice);
    const renamedChannel = channelsStore.save.secondCall.args[0] as Channel;
    expect(renamedChannel.name).to.equal('new name');
    expect(renamedChannel.labConfig).to.deep.equal(
      sourcesWithLabConfig.labConfig
    );
  });

  it('force save waits for the save in flight instead of enqueueing', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    const forcedSave = projectManager.save(UPDATED_SOURCE_2, true);
    finishFirstSourceSave();
    await firstSave;
    await forcedSave;

    assert.isTrue(sourcesStore.save.calledTwice);
    expect(sourcesStore.save.secondCall.args[1]).to.deep.equal(
      UPDATED_SOURCE_2
    );
  });

  it('cleanUp flushes changes made during a save in flight', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    const finishFirstSourceSave = deferNextSourceSave(sourcesStore);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    await projectManager.load();

    const firstSave = projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);
    const cleanUp = projectManager.cleanUp();
    finishFirstSourceSave();
    await firstSave;
    await cleanUp;

    assert.isTrue(sourcesStore.save.calledTwice);
    expect(sourcesStore.save.secondCall.args[1]).to.deep.equal(
      UPDATED_SOURCE_2
    );
  });

  it('retries the channel save after it fails', async () => {
    const sourcesWithLabConfig: ProjectSources = {
      source: 'fakeSource2',
      labConfig: {music: {packId: 'fakePack'}},
    };
    stubSuccessfulSourceLoad(sourcesStore);
    channelsStore.save.onFirstCall().rejects(new Error('channel save failed'));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
      metricsReporter: stubObject<LabMetricsReporter>(new LabMetricsReporter()),
    });
    await projectManager.load();

    // The source lands, then the channel save fails.
    await projectManager.save(sourcesWithLabConfig);
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);

    // The channel is still pending, so the next save retries it. Only the
    // channel: the source already saved.
    await projectManager.flushSave();
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledTwice);
    const retriedChannel = channelsStore.save.secondCall.args[0] as Channel;
    expect(retriedChannel.labConfig).to.deep.equal(
      sourcesWithLabConfig.labConfig
    );
  });

  it('retries the channel save after it fails with no channel edits pending', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    channelsStore.save.onFirstCall().rejects(new Error('channel save failed'));
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
      metricsReporter: stubObject<LabMetricsReporter>(new LabMetricsReporter()),
    });
    await projectManager.load();

    // The source lands, then the channel save fails. Nothing about the channel
    // itself changed here, so only the failure marks it as needing another write.
    await projectManager.save(UPDATED_SOURCE);
    assert.isTrue(channelsStore.save.calledOnce);

    await projectManager.flushSave();
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledTwice);

    // Once it succeeds, a later save with nothing to do stays a noop.
    await projectManager.flushSave();
    assert.isTrue(channelsStore.save.calledTwice);
  });

  it('keeps a rename made while a failing channel save was in flight', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    let failChannelSave!: () => void;
    channelsStore.save.onFirstCall().returns(
      new Promise<Response>((_resolve, reject) => {
        failChannelSave = () => reject(new Error('channel save failed'));
      })
    );
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
      metricsReporter: stubObject<LabMetricsReporter>(new LabMetricsReporter()),
    });
    await projectManager.load();

    // This save suspends inside the channel save, which then fails.
    const firstSave = projectManager.save(UPDATED_SOURCE);
    const rename = projectManager.rename('new name');
    failChannelSave();
    await firstSave;
    await rename;

    // The failed save must not have replaced the pending rename with its own
    // stale copy of the channel.
    assert.isTrue(channelsStore.save.calledTwice);
    const renamedChannel = channelsStore.save.secondCall.args[0] as Channel;
    expect(renamedChannel.name).to.equal('new name');
  });

  it('createCommit throws when the project has no saved version', async () => {
    sourcesStore.getCurrentVersionId.returns(null);
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });

    let error: Error | undefined;
    try {
      await projectManager.createCommit('a note');
    } catch (e) {
      error = e as Error;
    }
    expect(error?.message).to.contain('no saved version');
  });

  it('createCommit posts the comment against the flushed version', async () => {
    sourcesStore.getCurrentVersionId.returns('v123');
    const post = sinon.stub(HttpClient, 'post').resolves(new Response(''));
    try {
      const projectManager = new ProjectManager({
        sourcesStore,
        channelsStore,
        channelId: FAKE_CHANNEL_ID,
        reduceChannelUpdates: false,
        isStandaloneProjectLevel: false,
      });
      await projectManager.createCommit('a note');

      sinon.assert.calledOnce(post);
      const [url, body] = post.firstCall.args;
      expect(url).to.equal('/project_commits');
      expect(JSON.parse(body as string)).to.deep.equal({
        storage_id: FAKE_CHANNEL_ID,
        version_id: 'v123',
        comment: 'a note',
      });
      // Later saves must start a new version so this one stays intact.
      assert.isTrue(projectManager.getForceNewVersion());
    } finally {
      post.restore();
    }
  });

  it('tags a source save failure with what triggered it', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    sourcesStore.save.rejects(new TypeError('Failed to fetch'));
    const metricsReporter = stubObject<LabMetricsReporter>(
      new LabMetricsReporter()
    );
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
      metricsReporter,
    });
    await projectManager.load();

    await projectManager.save(UPDATED_SOURCE);
    await projectManager.flushSave(/* forceNewVersion */ false, 'unload');

    const triggers = metricsReporter.logError
      .getCalls()
      .map(call => (call.args[2] as {saveTrigger: string}).saveTrigger);
    expect(triggers).to.deep.equal(['autosave', 'unload']);
  });

  it('reports payload size and connectivity with a source save failure', async () => {
    stubSuccessfulSourceLoad(sourcesStore);
    sourcesStore.save.rejects(new TypeError('Failed to fetch'));
    const metricsReporter = stubObject<LabMetricsReporter>(
      new LabMetricsReporter()
    );
    const projectManager = new ProjectManager({
      sourcesStore,
      channelsStore,
      channelId: FAKE_CHANNEL_ID,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
      metricsReporter,
    });
    await projectManager.load();

    await projectManager.save(UPDATED_SOURCE);

    sinon.assert.calledOnce(metricsReporter.logError);
    const details = metricsReporter.logError.firstCall.args[2] as {
      payloadBytes: number;
      navigatorOnline: boolean;
      visibilityState: string;
    };
    expect(details.payloadBytes).to.equal(
      new TextEncoder().encode(JSON.stringify(UPDATED_SOURCE)).length
    );
    expect(details.navigatorOnline).to.equal(navigator.onLine);
    expect(details.visibilityState).to.equal(document.visibilityState);
  });

  describe('a sources preparer', () => {
    const makeManager = async () => {
      stubSuccessfulSourceLoad(sourcesStore);
      const projectManager = new ProjectManager({
        sourcesStore,
        channelsStore,
        channelId: FAKE_CHANNEL_ID,
        reduceChannelUpdates: false,
        isStandaloneProjectLevel: false,
      });
      await projectManager.load();
      return projectManager;
    };

    it('saves what the preparer returns, and compares later saves with it', async () => {
      const projectManager = await makeManager();
      const prepared = {source: 'prepared'};
      const preparer = sinon.fake.resolves({sources: prepared});
      projectManager.setSourcesPreparer(preparer);
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isTrue(preparer.calledOnceWith(UPDATED_SOURCE));
      assert.deepEqual(sourcesStore.save.firstCall.args[1], prepared);
      expect(projectManager.getLastSource()).to.deep.equal(prepared);
      // Sources equal to what the preparer returned need no save.
      await projectManager.save({source: 'prepared'}, true);
      assert.isTrue(sourcesStore.save.calledOnce);
    });

    it('fails the save when the preparer throws', async () => {
      const projectManager = await makeManager();
      const failed = sinon.fake();
      projectManager.addSaveFailListener(failed);
      projectManager.setSourcesPreparer(() =>
        Promise.reject(new Error('upload failed'))
      );
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isTrue(sourcesStore.save.notCalled);
      assert.isTrue(failed.calledOnce);
      assert.isTrue(projectManager.hasUnsavedChanges());
    });

    it('says whether it has a preparer', async () => {
      const projectManager = await makeManager();
      assert.isFalse(projectManager.hasSourcesPreparer());
      projectManager.setSourcesPreparer(sinon.fake.resolves({sources: {}}));
      assert.isTrue(projectManager.hasSourcesPreparer());
    });

    it('gives the prepared sources as the settled ones', async () => {
      const projectManager = await makeManager();
      projectManager.setSourcesPreparer(
        sinon.fake.resolves({sources: {source: 'prepared'}})
      );
      const settledListener = sinon.stub();
      projectManager.addSourcesSettledListener(settledListener);
      await projectManager.save(UPDATED_SOURCE, true);
      assert.deepEqual(settledListener.lastCall.args[0], {
        saved: {source: 'prepared'},
        waiting: undefined,
      });
    });

    it('has no settled sources while the preparer runs', async () => {
      const projectManager = await makeManager();
      let finishPreparing: (prepared: {sources: ProjectSources}) => void = () =>
        undefined;
      projectManager.setSourcesPreparer(
        () => new Promise(resolve => (finishPreparing = resolve))
      );
      const save = projectManager.save(UPDATED_SOURCE, true);
      await drainMicrotasks();
      assert.isUndefined(projectManager.getSettledSources());
      finishPreparing({sources: UPDATED_SOURCE});
      await save;
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE
      );
    });

    it('writes nothing when an incomplete save has nothing new to store, and tries again', async () => {
      const clock = sinon.useFakeTimers({toFake: ['setTimeout', 'Date']});
      try {
        const projectManager = await makeManager();
        const preparer = sinon.stub();
        // What the preparer can save is what is already saved.
        preparer.resolves({sources: FAKE_SOURCE, incomplete: true});
        projectManager.setSourcesPreparer(preparer);
        const noopListener = sinon.stub();
        projectManager.addSaveNoopListener(noopListener);
        await projectManager.save(UPDATED_SOURCE, true);
        assert.isTrue(sourcesStore.save.notCalled);
        assert.isTrue(channelsStore.save.notCalled);
        assert.isTrue(noopListener.called);
        assert.isTrue(projectManager.hasUnsavedChanges());
        preparer.resolves({sources: UPDATED_SOURCE});
        await clock.tickAsync(30 * 1000);
        assert.isTrue(preparer.calledTwice);
        assert.isTrue(sourcesStore.save.calledOnce);
        assert.isFalse(projectManager.hasUnsavedChanges());
      } finally {
        clock.restore();
      }
    });

    it('keeps the sources pending and saves again after an incomplete save', async () => {
      const clock = sinon.useFakeTimers({toFake: ['setTimeout', 'Date']});
      try {
        const projectManager = await makeManager();
        const preparer = sinon.stub();
        preparer.onFirstCall().resolves({
          sources: {source: 'partial'},
          incomplete: true,
        });
        preparer.onSecondCall().resolves({sources: {source: 'whole'}});
        projectManager.setSourcesPreparer(preparer);
        await projectManager.save(UPDATED_SOURCE, true);
        assert.deepEqual(sourcesStore.save.firstCall.args[1], {
          source: 'partial',
        });
        assert.isTrue(projectManager.hasUnsavedChanges());
        await clock.tickAsync(30 * 1000);
        assert.isTrue(preparer.secondCall.calledWith(UPDATED_SOURCE));
        assert.deepEqual(sourcesStore.save.secondCall.args[1], {
          source: 'whole',
        });
        assert.isFalse(projectManager.hasUnsavedChanges());
      } finally {
        clock.restore();
      }
    });
  });

  describe('settled sources', () => {
    const makeManager = async () => {
      stubSuccessfulSourceLoad(sourcesStore);
      const projectManager = new ProjectManager({
        sourcesStore,
        channelsStore,
        channelId: FAKE_CHANNEL_ID,
        reduceChannelUpdates: false,
        isStandaloneProjectLevel: false,
      });
      await projectManager.load();
      return projectManager;
    };
    // A sources save that stays in flight until the test finishes it.
    const holdNextSave = () => {
      let finish: (response: Response) => void = () => undefined;
      let fail: (error: Error) => void = () => undefined;
      sourcesStore.save.callsFake(
        () =>
          new Promise<Response>((resolve, reject) => {
            finish = resolve;
            fail = reject;
          })
      );
      const release = () =>
        sourcesStore.save.callsFake(() => Promise.resolve(new Response('')));
      return {
        finish: () => {
          release();
          finish(new Response(''));
        },
        fail: () => {
          release();
          fail(new Error('500'));
        },
      };
    };

    it('has none before the project loads, or when only the channel loaded', async () => {
      const projectManager = new ProjectManager({
        sourcesStore,
        channelsStore,
        channelId: FAKE_CHANNEL_ID,
        reduceChannelUpdates: false,
        isStandaloneProjectLevel: false,
      });
      assert.isUndefined(projectManager.getSettledSources());
      // A reset load reads the channel and not the sources.
      await projectManager.load(true);
      assert.isUndefined(projectManager.getSettledSources());
    });

    it('gives the saved sources, and the sources waiting to be saved', async () => {
      const projectManager = await makeManager();
      assert.deepEqual(projectManager.getSettledSources(), {
        saved: FAKE_SOURCE,
        waiting: undefined,
      });
      await projectManager.save(UPDATED_SOURCE, true);
      // Within the save interval, so these sources wait.
      projectManager.save(UPDATED_SOURCE_2);
      assert.deepEqual(projectManager.getSettledSources(), {
        saved: UPDATED_SOURCE,
        waiting: UPDATED_SOURCE_2,
      });
    });

    it('has none while a save is in flight', async () => {
      const projectManager = await makeManager();
      const held = holdNextSave();
      const save = projectManager.save(UPDATED_SOURCE, true);
      await drainMicrotasks();
      assert.isUndefined(projectManager.getSettledSources());
      held.finish();
      await save;
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE
      );
    });

    it('has none after a failed sources save, until one succeeds', async () => {
      const projectManager = await makeManager();
      // A save reported as failed may still have been stored.
      sourcesStore.save.callsFake(() => Promise.reject(new Error('500')));
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isUndefined(projectManager.getSettledSources());
      sourcesStore.save.callsFake(() => Promise.resolve(new Response('')));
      await projectManager.save(UPDATED_SOURCE_2, true);
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE_2
      );
    });

    it('has none while a version is being restored, then gives the restored sources', async () => {
      const projectManager = await makeManager();
      let finishRestore: () => void = () => undefined;
      sourcesStore.restore.callsFake(
        () => new Promise<void>(resolve => (finishRestore = resolve))
      );
      sourcesStore.load.returns(Promise.resolve(UPDATED_SOURCE));
      const settledListener = sinon.stub();
      projectManager.addSourcesSettledListener(settledListener);
      const restored = projectManager.restoreSources('v1');
      await drainMicrotasks();
      assert.isUndefined(projectManager.getSettledSources());
      finishRestore();
      await restored;
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE
      );
      assert.deepEqual(settledListener.lastCall.args[0].saved, UPDATED_SOURCE);
    });

    it('has none after a failed restore, until a save succeeds', async () => {
      const projectManager = await makeManager();
      sourcesStore.restore.callsFake(() => Promise.reject(new Error('500')));
      let thrown: unknown;
      try {
        await projectManager.restoreSources('v1');
      } catch (error) {
        thrown = error;
      }
      assert.instanceOf(thrown, Error);
      assert.isUndefined(projectManager.getSettledSources());
      await projectManager.save(UPDATED_SOURCE, true);
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE
      );
    });

    it('has none once destroyed', async () => {
      const projectManager = await makeManager();
      projectManager.destroy();
      assert.isUndefined(projectManager.getSettledSources());
    });

    it('calls its listeners after a save that succeeds or finds nothing changed, and not after one that fails', async () => {
      const projectManager = await makeManager();
      const settledListener = sinon.stub();
      projectManager.addSourcesSettledListener(settledListener);
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isTrue(settledListener.calledOnce);
      assert.deepEqual(settledListener.firstCall.args[0], {
        saved: UPDATED_SOURCE,
        waiting: undefined,
      });
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isTrue(settledListener.calledTwice);
      sourcesStore.save.callsFake(() => Promise.reject(new Error('500')));
      await projectManager.save(UPDATED_SOURCE_2, true);
      assert.isTrue(settledListener.calledTwice);
    });

    it('saves normally when a listener throws', async () => {
      const projectManager = await makeManager();
      const later = sinon.stub();
      projectManager.addSourcesSettledListener(() => {
        throw new Error('lab bug');
      });
      projectManager.addSourcesSettledListener(later);
      const successListener = sinon.stub();
      projectManager.addSaveSuccessListener(successListener);
      await projectManager.save(UPDATED_SOURCE, true);
      assert.isTrue(successListener.calledOnce);
      assert.isTrue(later.calledOnce);
    });

    it('gives settled sources again after a save ends in an unexpected error', async () => {
      const projectManager = await makeManager();
      channelsStore.save
        .onFirstCall()
        .callsFake(() => Promise.resolve(new Response('not json')));
      let thrown: unknown;
      try {
        await projectManager.save(UPDATED_SOURCE, true);
      } catch (error) {
        thrown = error;
      }
      assert.instanceOf(thrown, Error);
      // The sources were stored before the channel response failed to parse.
      assert.deepEqual(
        projectManager.getSettledSources()?.saved,
        UPDATED_SOURCE
      );
    });

    it('starts a queued save only once the save in flight has finished', async () => {
      const clock = sinon.useFakeTimers({toFake: ['setTimeout', 'Date']});
      try {
        const projectManager = await makeManager();
        const held = holdNextSave();
        const slow = projectManager.save(UPDATED_SOURCE, true);
        await clock.tickAsync(0);
        projectManager.save(UPDATED_SOURCE_2);
        // The queued save comes due while the slow one is still in flight.
        await clock.tickAsync(30 * 1000);
        assert.isTrue(sourcesStore.save.calledOnce);
        assert.isUndefined(projectManager.getSettledSources());
        held.finish();
        await slow;
        await clock.tickAsync(0);
        assert.isTrue(sourcesStore.save.calledTwice);
        assert.deepEqual(
          sourcesStore.save.secondCall.args[1],
          UPDATED_SOURCE_2
        );
        assert.deepEqual(
          projectManager.getSettledSources()?.saved,
          UPDATED_SOURCE_2
        );
      } finally {
        clock.restore();
      }
    });
  });
});

// Helper functions
function stubSuccessfulSourceLoad(sourcesStore: StubbedInstance<SourcesStore>) {
  sourcesStore.load.returns(Promise.resolve(FAKE_SOURCE));
}

// Hold the next source save open so a save stays in flight. Returns the function
// that lets that save finish.
function deferNextSourceSave(sourcesStore: StubbedInstance<SourcesStore>) {
  let finishSave!: () => void;
  const pendingSave = new Promise<Response>(resolve => {
    finishSave = () => resolve(new Response(''));
  });
  sourcesStore.save.onFirstCall().returns(pendingSave);
  return finishSave;
}

// Run every pending microtask, so anything that can settle has settled.
function drainMicrotasks() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
