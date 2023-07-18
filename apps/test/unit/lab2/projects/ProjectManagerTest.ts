import {RemoteChannelsStore} from '@cdo/apps/lab2/projects/ChannelsStore';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {RemoteSourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import {ProjectSources, Channel} from '@cdo/apps/lab2/types';
import {expect, assert} from 'chai';
import {stubObject, StubbedInstance} from 'ts-sinon';

describe('ProjectManager', () => {
  let sourcesStore: StubbedInstance<RemoteSourcesStore>;
  let channelsStore: StubbedInstance<RemoteChannelsStore>;
  const FAKE_CHANNEL_ID = 'fakeChannelId';

  const FAKE_SOURCE: ProjectSources = {
    source: 'fakeSource',
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

  beforeEach(() => {
    sourcesStore = stubObject<RemoteSourcesStore>(new RemoteSourcesStore());
    sourcesStore.load.returns(Promise.resolve(FAKE_SOURCE));
    // We need to create separate promises for each call so they can each
    // be read from.
    sourcesStore.save.onCall(0).returns(Promise.resolve(new Response('')));
    sourcesStore.save.onCall(1).returns(Promise.resolve(new Response('')));
    channelsStore = stubObject<RemoteChannelsStore>(new RemoteChannelsStore());
    channelsStore.load.returns(Promise.resolve(FAKE_CHANNEL));
    channelsStore.save
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(FAKE_CHANNEL))));
    channelsStore.save
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(FAKE_CHANNEL))));
  });

  it('returns sources and channel on load', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    const {sources, channel} = await projectManager.load();
    expect(sources).to.deep.equal(FAKE_SOURCE);
    expect(channel).to.deep.equal(FAKE_CHANNEL);
  });

  it('triggers save immediately on first save', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('does not trigger a save if source has not changed', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    await projectManager.save(FAKE_SOURCE);
    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.notCalled);
  });

  it('does not trigger another save if we already saved during the last save interval', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2);
    // We should only trigger a save once. The next save is enqueued
    // to happen in the next save interval.
    assert.isTrue(sourcesStore.save.calledOnce);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('always triggers a save on force save', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    await projectManager.save(UPDATED_SOURCE_2, true);
    // We should trigger a save twice; the first time is the initial save,
    // the second time because we forced a save.
    assert.isTrue(sourcesStore.save.calledTwice);
    assert.isTrue(channelsStore.save.calledTwice);
  });

  it('does not trigger save if destroyed', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    projectManager.destroy();
    await projectManager.save(UPDATED_SOURCE);

    assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.notCalled);
  });

  it('skips second channel update in emergency mode', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      true /* turn emergency mode on */
    );
    await projectManager.load();
    await projectManager.save(UPDATED_SOURCE);
    // call second save with force save so that we save immediately
    await projectManager.save(UPDATED_SOURCE_2, true);

    // We should trigger a source save twice, but a channel save once.
    // We only save the first channel update in emergency mode.
    assert.isTrue(sourcesStore.save.calledTwice);
    assert.isTrue(channelsStore.save.calledOnce);
  });

  it('only triggers a channel save on rename', async () => {
    const projectManager = new ProjectManager(
      sourcesStore,
      channelsStore,
      FAKE_CHANNEL_ID,
      false
    );
    await projectManager.load();
    await projectManager.rename('new name');
    //assert.isTrue(sourcesStore.save.notCalled);
    assert.isTrue(channelsStore.save.calledOnce);
  });
});
