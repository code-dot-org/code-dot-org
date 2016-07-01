import 'babel-polyfill'; // required for Symbol
import sinon from 'sinon';
import {expect, assert} from '../util/configuredChai';
var clientApi = require('@cdo/apps/clientApi');

describe('clientApi module', () => {
  var server, xhr, requests, oldWindowDashboard;

  beforeEach(() => {
    // override window.dashboard... ugh...
    oldWindowDashboard = window.dashboard;
    window.dashboard = {
      project: {
        getCurrentId: () => 'some-project',
      },
    };

    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    window.dashboard = oldWindowDashboard;
    xhr.restore();
  });

  describe('the ajax function', (done) => {
    it('will complain if window.dashboard is not set, because ugh...', () => {
      window.dashboard = undefined;
      clientApi.assets.ajax(
        'GET',
        '',
        () => assert.fail('success called', 'error called'),
        done
      );
    });

    it('will call the error handler with the xhr object when response status is >= 400', done => {
      clientApi.assets.ajax(
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
      clientApi.assets.ajax(
        'GET',
        'does-not-exist',
        () => assert.fail('success called', 'error called')
      );
      requests[0].respond(404, {}, 'Not Found');
    });

    it('will call the success handler with the xhr object when response status is < 400', done => {
      clientApi.assets.ajax(
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
  });

  describe('assets api', () => {
    it('should have a copyAssets method', () => {
      clientApi.assets.copyAssets(
        'some-source-project',
        ['some-file.png']
      );

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('POST');
      expect(requests[0].url).to.equal('/v3/copy-assets/some-project?src_channel=some-source-project&src_files=%5B%22some-file.png%22%5D');
    });
  });
});
