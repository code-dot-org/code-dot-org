// Naming a version, and the order that makes the name mean something.
//
// Ported from `apps/src/lab2/projects/ProjectManager.ts`, where the AI Tutor
// has called it since the feature shipped. The frontend port left it out, so
// Accept in `frontend/packages/labs/*` asked the student to name a version and
// then threw the name away — worse than not asking, because it promised
// something to come back to and made nothing.
//
// Three steps, and each of them is load-bearing:
//
//   flushSave(forceNewVersion: true)  makes a version of its own, rather than
//                                     folding into one holding other edits
//   getCurrentVersionId()             the version there now is to name
//   setForceNewVersion(true)          stops the next autosave writing into the
//                                     version just named — a commit you can go
//                                     back to has to stop changing

import {describe, expect, it, vi} from 'vitest';

import ProjectManager from '../ProjectManager';

/** A manager with every collaborator stubbed but the logic under test real. */
const managerWith = (versionId: string | null) => {
  const updateCommit = vi.fn().mockResolvedValue({});
  const sourcesStore = {
    getCurrentVersionId: () => versionId,
  } as never;
  const manager = new ProjectManager({
    apiClient: {projects: {updateCommit}} as never,
    queryClient: {} as never,
    sourcesStore,
    channelsStore: {} as never,
    channelId: 'channel-1',
    metricsReporter: {logError: vi.fn(), logInfo: vi.fn()} as never,
    reduceChannelUpdates: false,
    isStandaloneProjectLevel: false,
  });
  const flushSave = vi
    .spyOn(manager, 'flushSave')
    .mockResolvedValue({} as never);
  const setForceNewVersion = vi.spyOn(manager, 'setForceNewVersion');
  return {manager, updateCommit, flushSave, setForceNewVersion};
};

describe('createCommit', () => {
  it('flushes a version of its OWN before naming one', async () => {
    const {manager, flushSave} = managerWith('v9');

    await manager.createCommit('Added Boundaries');

    // Without the flag the save folds into whichever version is current, and
    // the name would sit on a version holding edits nobody meant to commit.
    expect(flushSave).toHaveBeenCalledWith(true);
  });

  it('records the comment against the version that flush produced', async () => {
    const {manager, updateCommit} = managerWith('v9');

    await manager.createCommit('Added Boundaries');

    expect(updateCommit).toHaveBeenCalledWith({
      channelId: 'channel-1',
      versionId: 'v9',
      comment: 'Added Boundaries',
    });
  });

  it('stops the next save writing into the version it just named', async () => {
    const {manager, setForceNewVersion} = managerWith('v9');

    await manager.createCommit('Added Boundaries');

    expect(setForceNewVersion).toHaveBeenCalledWith(true);
  });

  it('refuses when the flush produced no version to name', async () => {
    // Naming nothing would report success and leave the student with no
    // version to go back to, which is the failure this whole thing exists to
    // prevent.
    const {manager, updateCommit} = managerWith(null);

    await expect(manager.createCommit('Added Boundaries')).rejects.toThrow(
      'no saved version',
    );
    expect(updateCommit).not.toHaveBeenCalled();
  });
});
