import {assert} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';

describe('LibraryClientApi', () => {
  const channelId = 'abc123';

  describe('constructor', () => {});

  describe('unpublish', () => {
    let libraryApi, server, channelUpdateStub, project, unpublishCallback;

    beforeEach(() => {
      libraryApi = new LibraryClientApi(channelId);
      server = sinon.fakeServer.create();
      channelUpdateStub = sinon.stub(libraryApi.channelApi, 'update');
      project = {
        name: 'My Project',
        libraryName: 'My Library',
        libraryDescription: 'A very cool library!',
        libraryPublishedAt: new Date()
      };
      unpublishCallback = sinon.stub();
    });

    afterEach(() => {
      server.restore();
      channelUpdateStub.restore();
    });

    const setDeleteLibraryResponse = status => {
      server.respondWith('delete', `/v3/libraries/${channelId}/library.json`, [
        status,
        {'Content-Type': 'application/json'},
        ''
      ]);
    };

    it('updates the channel on success', () => {
      setDeleteLibraryResponse(204);
      const updatedProject = {
        ...project,
        libraryName: undefined,
        libraryDescription: undefined,
        libraryPublishedAt: null
      };

      libraryApi.unpublish(project, unpublishCallback);
      server.respond();

      assert(
        channelUpdateStub.calledOnceWith(
          channelId,
          updatedProject,
          unpublishCallback
        )
      );
    });

    it('invokes callback on failure', () => {
      setDeleteLibraryResponse(500);

      libraryApi.unpublish(project, unpublishCallback);
      server.respond();

      assert.equal(0, channelUpdateStub.callCount);
      assert(unpublishCallback.calledOnce);
    });
  });
});
