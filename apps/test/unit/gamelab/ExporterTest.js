import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import Exporter from '@cdo/apps/p5lab/gamelab/Exporter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import pageConstantsReducer, {
  setPageConstants,
} from '@cdo/apps/redux/pageConstants';

var testUtils = require('../../util/testUtils');

const emptyAnimationOpts = {
  animationList: {
    orderedKeys: [],
    propsByKey: {},
    pendingFrames: {},
  },
  allAnimationsSingleFrame: false,
  pauseAnimationsByDefault: false,
};

const WEBPACK_RUNTIME_JS_CONTENT = 'webpack-runtime.js content';
const P5_JS_CONTENT = 'p5.js content';
const P5_PLAY_JS_CONTENT = 'p5.play.js content';
const GAMELAB_API_MIN_JS_CONTENT = 'gamelab-api.min.js content';
const GAMELAB_CSS_CONTENT = `
.some-css-rule {
  background-image: url("/blockly/media/foo.png");
}
#some-other-rule {
  background-image: url('/blockly/media/bar.jpg');
}
a.third-rule {
  background-image: url(/blockly/media/third.jpg);
}
`;

const JQUERY_JS_CONTENT = 'jquery content';
const PNG_ASSET_CONTENT = 'asset content';

describe('The Gamelab Exporter,', function () {
  var server;
  let stashedCookieKey;

  testUtils.setExternalGlobals();

  beforeEach(function () {
    server = sinon.fakeServerWithClock.create();
    server.respondWith(
      /\/blockly\/js\/webpack-runtime\.js\?__cb__=\d+/,
      WEBPACK_RUNTIME_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/js\/p5play\/p5\.js\?__cb__=\d+/,
      P5_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/js\/p5play\/p5\.play\.js\?__cb__=\d+/,
      P5_PLAY_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/js\/gamelab-api\.min\.js\?__cb__=\d+/,
      GAMELAB_API_MIN_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/css\/gamelab\.css\?__cb__=\d+/,
      GAMELAB_CSS_CONTENT
    );
    server.respondWith(
      'https://code.jquery.com/jquery-1.12.1.min.js',
      JQUERY_JS_CONTENT
    );
    server.respondWith(/\/webpack_output\/.*\.png/, PNG_ASSET_CONTENT);
    server.respondWith(
      '/api/v1/sound-library/default.mp3',
      'default.mp3 content'
    );

    assetPrefix.init({
      channel: 'some-channel-id',
      assetPathPrefix: '/v3/assets/',
    });

    if (!window.dashboard.assets.listStore.list.returns) {
      sinon.stub(window.dashboard.assets.listStore, 'list');
    }
    window.dashboard.assets.listStore.list.returns([
      {filename: 'foo.png'},
      {filename: 'bar.png'},
      {filename: 'zoo.mp3'},
    ]);
    server.respondWith('/v3/assets/some-channel-id/foo.png', 'foo.png content');
    server.respondWith('/v3/assets/some-channel-id/bar.png', 'bar.png content');
    server.respondWith('/v3/assets/some-channel-id/zoo.mp3', 'zoo.mp3 content');

    server.respondWith('/blockly/media/foo.png', 'blockly foo.png content');
    server.respondWith('/blockly/media/bar.jpg', 'blockly bar.jpg content');
    server.respondWith('/blockly/media/third.jpg', 'blockly third.jpg content');

    stashedCookieKey = window.userNameCookieKey;
    window.userNameCookieKey = 'CoolUser';
    stubRedux();
    registerReducers({pageConstants: pageConstantsReducer});
    getStore().dispatch(
      setPageConstants({
        isCurriculumLevel: true,
      })
    );
  });

  afterEach(function () {
    server.restore();
    assetPrefix.init({});
    window.userNameCookieKey = stashedCookieKey;
    restoreRedux();
  });

  describe("when assets can't be fetched,", function () {
    beforeEach(function () {
      server.respondWith(/\/blockly\/js\/p5play\/p5\.js\?__cb__=\d+/, [
        500,
        {},
        '',
      ]);
    });

    it('should reject the promise with an error', function (done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");',
        emptyAnimationOpts
      );
      zipPromise.then(
        function () {
          expect(false).toBe(true);
          done();
        },
        function (error) {
          expect(error.message).toEqual('failed to fetch assets');
          done();
        }
      );
    });
  });

  describe('when exporting,', function () {
    var zipFiles = {};
    beforeEach(function (done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");\nplaySound("zoo.mp3");\nplaySound("sound://default.mp3");',
        emptyAnimationOpts
      );

      zipPromise.then(function (zip) {
        var relativePaths = [];
        zip.forEach(function (relativePath, file) {
          relativePaths.push(relativePath);
        });
        var zipAsyncPromises = relativePaths.map(function (path) {
          var zipObject = zip.file(path);
          if (zipObject) {
            return zipObject.async('string');
          }
        });
        Promise.all(zipAsyncPromises).then(function (fileContents) {
          relativePaths.forEach(function (path, index) {
            zipFiles[path] = fileContents[index];
          });
          done();
        }, done);
      }, done);
    });

    describe('will produce a zip file, which', function () {
      it('should contain a bunch of files', () => {
        const files = Object.keys(zipFiles);
        files.sort();
        expect(files).toEqual([
          'my-app/',
          'my-app/assets/',
          'my-app/assets/bar.png',
          'my-app/assets/default.mp3',
          'my-app/assets/foo.png',
          'my-app/assets/zoo.mp3',
          'my-app/code.js',
          'my-app/gamelab-api.js',
          'my-app/gamelab.css',
          'my-app/index.html',
          'my-app/p5.js',
          'my-app/p5.play.js',
        ]);
      });

      it('should contain a p5.js file', function () {
        expect('my-app/p5.js' in zipFiles).toBeTruthy();
        expect(zipFiles['my-app/p5.js']).toEqual(P5_JS_CONTENT);
      });

      it('should contain a p5.play.js file', function () {
        expect('my-app/p5.play.js' in zipFiles).toBeTruthy();
        expect(zipFiles['my-app/p5.play.js']).toEqual(P5_PLAY_JS_CONTENT);
      });

      it('should contain a gamelab-api.js file', function () {
        expect('my-app/gamelab-api.js' in zipFiles).toBeTruthy();
        expect(zipFiles['my-app/gamelab-api.js']).toEqual(
          `${WEBPACK_RUNTIME_JS_CONTENT}\n${GAMELAB_API_MIN_JS_CONTENT}`
        );
      });

      it('should contain a gamelab.css file', function () {
        expect('my-app/gamelab.css' in zipFiles).toBeTruthy();
        expect(zipFiles['my-app/gamelab.css']).toEqual(GAMELAB_CSS_CONTENT);
      });

      describe('the index.html file', () => {
        let el;
        beforeEach(() => {
          el = document.createElement('html');
          el.innerHTML = zipFiles['my-app/index.html'];
        });

        it('should have a #sketch element', () => {
          expect(el.querySelector('#sketch')).not.toBeNull();
        });

        it('should have a #soft-buttons element', () => {
          expect(el.querySelector('#soft-buttons')).not.toBeNull();
        });

        it('should have a #studio-dpad-container element', () => {
          expect(el.querySelector('#studio-dpad-container')).not.toBeNull();
        });
      });

      it('should contain a code.js file', function () {
        expect('my-app/code.js' in zipFiles).toBeTruthy();
      });

      it('should contain the asset files used by the project', function () {
        expect('my-app/assets/foo.png' in zipFiles).toBeTruthy();
        expect('my-app/assets/bar.png' in zipFiles).toBeTruthy();
        expect('my-app/assets/zoo.mp3' in zipFiles).toBeTruthy();
      });

      it('should contain the sound library files referenced by the project', function () {
        expect('my-app/assets/default.mp3' in zipFiles).toBeTruthy();
      });

      it('should rewrite urls in the code to point to the correct asset files', function () {
        expect(zipFiles['my-app/code.js']).toContain(
          'console.log("hello");\nplaySound("assets/zoo.mp3");\nplaySound("assets/default.mp3");'
        );
      });
    });
  });

  function runExportedApp(code, animationOpts, done, globalPromiseName) {
    const originalP5 = window.p5;
    const originalPreload = window.preload;
    const originalSetup = window.setup;
    server.respondImmediately = true;
    let zipPromise = Exporter.exportAppToZip('my-app', code, animationOpts);

    const relativePaths = [];
    return zipPromise
      .then(zip => {
        zip.forEach((relativePath, file) => relativePaths.push(relativePath));
        return Promise.all(
          relativePaths.map(path => {
            var zipObject = zip.file(path);
            if (zipObject) {
              return zipObject.async('string');
            }
          })
        )
          .then(async fileContents => {
            const zipFiles = {};
            relativePaths.forEach((path, index) => {
              zipFiles[path] = fileContents[index];
            });
            const htmlFile = zipFiles['my-app/index.html'];
            document.body.innerHTML = htmlFile.slice(
              htmlFile.indexOf('<body>') + '<body>'.length,
              htmlFile.indexOf('</body>')
            );
            window.$ = require('jquery');

            // webpack-runtime must appear exactly once on any page containing webpack entries.
            require('../../../build/package/js/webpack-runtime.js');
            require('../../../build/package/js/gamelab-api.js');

            //
            // Note: we are simulating a p5.js environment and manually calling
            // preload() and setup() since we don't have p5.play.js loaded
            //
            // (dynamic require on p5.play.js has issues with its p5 module dependency)
            //
            window.p5 = require('../../../build/package/js/p5play/p5.js');

            eval(zipFiles['my-app/code.js']); // eslint-disable-line no-eval

            window.preload();
            window.setup();

            if (globalPromiseName) {
              await window[globalPromiseName];
            }
            done();
          })
          .catch(e => {
            done(e);
          });
      })
      .finally(() => {
        window.p5 = originalP5;
        window.preload = originalPreload;
        window.setup = originalSetup;
      });
  }

  // TODO: Address infinite loop caused by runExportedApp helper used in 'Regression tests' block.
  // See ticket for more details: https://codedotorg.atlassian.net/browse/STAR-2399
  describe.skip('Regression tests', () => {
    testUtils.sandboxDocumentBody();

    it('should allow you to play a sound', done => {
      window.testPromise = new Promise(
        resolve => (window.resolveTestPromise = resolve)
      );
      runExportedApp(
        `
          playSound("https://studio.code.org/blockly/media/example.mp3", false);
          window.resolveTestPromise();
          `,
        emptyAnimationOpts,
        done,
        'testPromise'
      );
    });
  });
});
