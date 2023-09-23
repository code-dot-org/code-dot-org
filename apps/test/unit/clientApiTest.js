import sinon from 'sinon';
import {expect, assert} from '../util/reconfiguredChai';
import project from '@cdo/apps/code-studio/initApp/project';
import {assets, starterAssets} from '@cdo/apps/clientApi';

describe('clientApi module', () => {
  var xhr, requests;

  beforeEach(() => {
    sinon.stub(project, 'getCurrentId').returns('some-project');
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    project.getCurrentId.restore();
    xhr.restore();
  });

  describe('the withProjectId function', () => {
    it('returns a copy of the clientApi with the projectId set', () => {
      var newApi = assets.withProjectId('some-other-project');
      expect(assets.projectId).to.be.undefined;
      expect(newApi.projectId).to.equal('some-other-project');
      expect(newApi).to.be.an.instanceof(assets.constructor);
    });
  });

  describe('the ajax function', done => {
    it('will call the error handler with the xhr object when response status is >= 400', done => {
      assets.ajax(
        'GET',
        'does-not-exist',
        () => assert.fail('success called', 'error called'),
        xhr => {
          expect(xhr.status).to.equal(404);
          done();
        }
      );
      expect(requests).to.have.length(1);
      requests[0].respond(404, {}, 'Not Found');
    });

    it('will fail silently if no error handler is passed in', () => {
      assets.ajax('GET', 'does-not-exist', () =>
        assert.fail('success called', 'error called')
      );
      requests[0].respond(404, {}, 'Not Found');
    });

    it('will call the success handler with the xhr object when response status is < 400', done => {
      assets.ajax(
        'GET',
        'exists.png',
        xhr => {
          expect(xhr.status).to.equal(200);
          done();
        },
        () => assert.fail('error called', 'success called')
      );
      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('GET');
      expect(requests[0].url).to.equal('/v3/assets/some-project/exists.png');
      requests[0].respond(200, {}, 'this is an asset!');
    });

    it('will use the specified projectId for the url when set', () => {
      assets.withProjectId('some-other-project').ajax();
      expect(requests[0].url).to.equal('/v3/assets/some-other-project');
    });
  });

  describe('assets api', () => {
    it('should have a copyAssets method', () => {
      assets.copyAssets('some-source-project', ['some-file.png']);

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('POST');
      expect(requests[0].url).to.equal(
        '/v3/copy-assets/some-project?src_channel=some-source-project&src_files=%5B%22some-file.png%22%5D'
      );
    });

    it('puts an audio asset to the correct url', () => {
      assets.putAsset('some-source-project', ['some-audio.mp3']);

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('PUT');
      expect(requests[0].url).to.equal(
        '/v3/assets/some-project/some-source-project'
      );
    });
  });

  describe('starter assets api', () => {
    const levelName = 1;

    describe('getStarterAssets', () => {
      it('makes an ajax request to the correct url', () => {
        starterAssets.getStarterAssets(
          levelName,
          () => {},
          () => {}
        );

        expect(requests).to.have.length(1);
        expect(requests[0].method).to.equal('GET');
        expect(requests[0].url).to.equal(`/level_starter_assets/${levelName}/`);
      });
    });

    describe('withLevelName', () => {
      it('binds levelName to the api and returns the bound api', () => {
        const boundApi = starterAssets.withLevelName(levelName);

        assert.equal(levelName, boundApi.levelName);
      });
    });

    describe('basePath', () => {
      it('returns the correct base path', () => {
        const path = 'some-path';
        const boundApi = starterAssets.withLevelName(levelName);

        assert.equal(
          `/level_starter_assets/${levelName}/${path}`,
          boundApi.basePath(path)
        );
      });

      it('throws an error if StarterAssetsApi is not bound', () => {
        assert.throws(
          starterAssets.basePath,
          'You must bind the API and set levelName before creating a base path.'
        );
      });

      it('throws an error if levelName is not set', () => {
        const boundApi = starterAssets.withLevelName(undefined);
        assert.throws(
          boundApi.basePath,
          'You must bind the API and set levelName before creating a base path.'
        );
      });
    });
  });
});
