import {assert, expect} from '../../util/configuredChai';
import sinon from 'sinon';

var testUtils = require('../../util/testUtils');
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import Exporter from '@cdo/apps/p5lab/gamelab/Exporter';

const emptyAnimationOpts = {
  animationList: {
    orderedKeys: [],
    propsByKey: {},
    pendingFrames: {}
  },
  allAnimationsSingleFrame: false,
  pauseAnimationsByDefault: false
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

describe('The Gamelab Exporter,', function() {
  var server;
  let stashedCookieKey;

  testUtils.setExternalGlobals();

  beforeEach(function() {
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
    server.respondWith(/\/_karma_webpack_\/.*\.png/, PNG_ASSET_CONTENT);
    server.respondWith(
      '/api/v1/sound-library/default.mp3',
      'default.mp3 content'
    );

    assetPrefix.init({
      channel: 'some-channel-id',
      assetPathPrefix: '/v3/assets/'
    });

    if (!window.dashboard.assets.listStore.list.returns) {
      sinon.stub(window.dashboard.assets.listStore, 'list');
    }
    window.dashboard.assets.listStore.list.returns([
      {filename: 'foo.png'},
      {filename: 'bar.png'},
      {filename: 'zoo.mp3'}
    ]);
    server.respondWith('/v3/assets/some-channel-id/foo.png', 'foo.png content');
    server.respondWith('/v3/assets/some-channel-id/bar.png', 'bar.png content');
    server.respondWith('/v3/assets/some-channel-id/zoo.mp3', 'zoo.mp3 content');

    server.respondWith('/blockly/media/foo.png', 'blockly foo.png content');
    server.respondWith('/blockly/media/bar.jpg', 'blockly bar.jpg content');
    server.respondWith('/blockly/media/third.jpg', 'blockly third.jpg content');

    stashedCookieKey = window.userNameCookieKey;
    window.userNameCookieKey = 'CoolUser';
  });

  afterEach(function() {
    server.restore();
    assetPrefix.init({});
    window.userNameCookieKey = stashedCookieKey;
  });

  describe("when assets can't be fetched,", function() {
    beforeEach(function() {
      server.respondWith(/\/blockly\/js\/p5play\/p5\.js\?__cb__=\d+/, [
        500,
        {},
        ''
      ]);
    });

    it('should reject the promise with an error', function(done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");',
        emptyAnimationOpts
      );
      zipPromise.then(
        function() {
          assert.fail('Expected zipPromise not to resolve');
          done();
        },
        function(error) {
          assert.equal(error.message, 'failed to fetch assets');
          done();
        }
      );
    });

    it('should reject the promise with an error in expoMode', function(done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");',
        emptyAnimationOpts,
        true
      );
      zipPromise.then(
        function() {
          assert.fail('Expected zipPromise not to resolve');
          done();
        },
        function(error) {
          assert.equal(error.message, 'failed to fetch assets');
          done();
        }
      );
    });
  });

  describe('when exporting,', function() {
    var zipFiles = {};
    beforeEach(function(done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");\nplaySound("zoo.mp3");\nplaySound("sound://default.mp3");',
        emptyAnimationOpts
      );

      zipPromise.then(function(zip) {
        var relativePaths = [];
        zip.forEach(function(relativePath, file) {
          relativePaths.push(relativePath);
        });
        var zipAsyncPromises = relativePaths.map(function(path) {
          var zipObject = zip.file(path);
          if (zipObject) {
            return zipObject.async('string');
          }
        });
        Promise.all(zipAsyncPromises).then(function(fileContents) {
          relativePaths.forEach(function(path, index) {
            zipFiles[path] = fileContents[index];
          });
          done();
        }, done);
      }, done);
    });

    describe('will produce a zip file, which', function() {
      it('should contain a bunch of files', () => {
        const files = Object.keys(zipFiles);
        files.sort();
        assert.deepEqual(files, [
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
          'my-app/p5.play.js'
        ]);
      });

      it('should contain a p5.js file', function() {
        assert.property(zipFiles, 'my-app/p5.js');
        assert.equal(zipFiles['my-app/p5.js'], P5_JS_CONTENT);
      });

      it('should contain a p5.play.js file', function() {
        assert.property(zipFiles, 'my-app/p5.play.js');
        assert.equal(zipFiles['my-app/p5.play.js'], P5_PLAY_JS_CONTENT);
      });

      it('should contain a gamelab-api.js file', function() {
        assert.property(zipFiles, 'my-app/gamelab-api.js');
        assert.equal(
          zipFiles['my-app/gamelab-api.js'],
          `${WEBPACK_RUNTIME_JS_CONTENT}\n${GAMELAB_API_MIN_JS_CONTENT}`
        );
      });

      it('should contain a gamelab.css file', function() {
        assert.property(zipFiles, 'my-app/gamelab.css');
        assert.equal(zipFiles['my-app/gamelab.css'], GAMELAB_CSS_CONTENT);
      });

      describe('the index.html file', () => {
        let el;
        beforeEach(() => {
          el = document.createElement('html');
          el.innerHTML = zipFiles['my-app/index.html'];
        });

        it('should have a #sketch element', () => {
          assert.isNotNull(el.querySelector('#sketch'), 'no #sketch element');
        });

        it('should have a #soft-buttons element', () => {
          assert.isNotNull(
            el.querySelector('#soft-buttons'),
            'no #soft-buttons element'
          );
        });

        it('should have a #studio-dpad-container element', () => {
          assert.isNotNull(
            el.querySelector('#studio-dpad-container'),
            'no #studio-dpad-container element'
          );
        });
      });

      it('should contain a code.js file', function() {
        assert.property(zipFiles, 'my-app/code.js');
      });

      it('should contain the asset files used by the project', function() {
        assert.property(zipFiles, 'my-app/assets/foo.png');
        assert.property(zipFiles, 'my-app/assets/bar.png');
        assert.property(zipFiles, 'my-app/assets/zoo.mp3');
      });

      it('should contain the sound library files referenced by the project', function() {
        assert.property(zipFiles, 'my-app/assets/default.mp3');
      });

      it('should rewrite urls in the code to point to the correct asset files', function() {
        expect(zipFiles['my-app/code.js']).to.include(
          'console.log("hello");\nplaySound("assets/zoo.mp3");\nplaySound("assets/default.mp3");'
        );
      });
    });
  });

  describe('when exporting in expoMode,', function() {
    var zipFiles = {};
    beforeEach(function(done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");\nplaySound("zoo.mp3");\nplaySound("sound://default.mp3");',
        emptyAnimationOpts,
        true
      );

      zipPromise.then(function(zip) {
        var relativePaths = [];
        zip.forEach(function(relativePath, file) {
          relativePaths.push(relativePath);
        });
        var zipAsyncPromises = relativePaths.map(function(path) {
          var zipObject = zip.file(path);
          if (zipObject) {
            return zipObject.async('string');
          }
        });
        Promise.all(zipAsyncPromises).then(function(fileContents) {
          relativePaths.forEach(function(path, index) {
            zipFiles[path] = fileContents[index];
          });
          done();
        }, done);
      }, done);
    });

    describe('will produce a zip file, which', function() {
      it('should contain a bunch of files', () => {
        const files = Object.keys(zipFiles);
        files.sort();
        assert.deepEqual(files, [
          'my-app/',
          'my-app/App.js',
          'my-app/CustomAsset.js',
          'my-app/DataWarning.js',
          'my-app/app.json',
          'my-app/appassets/',
          'my-app/appassets/icon.png',
          'my-app/appassets/splash.png',
          'my-app/appassets/warning.png',
          'my-app/assets/',
          'my-app/assets/bar.png',
          'my-app/assets/code.j',
          'my-app/assets/default.mp3',
          'my-app/assets/foo.png',
          'my-app/assets/gamelab-api.j',
          'my-app/assets/gamelab.css',
          'my-app/assets/index.html',
          'my-app/assets/jquery-1.12.1.min.j',
          'my-app/assets/p5.j',
          'my-app/assets/p5.play.j',
          'my-app/assets/zoo.mp3',
          'my-app/metro.config.js',
          'my-app/package.json',
          'my-app/packagedFiles.js'
        ]);
      });

      it('should contain a p5.js file', function() {
        assert.property(zipFiles, 'my-app/assets/p5.j');
        assert.equal(zipFiles['my-app/assets/p5.j'], P5_JS_CONTENT);
      });

      it('should contain a p5.play.js file', function() {
        assert.property(zipFiles, 'my-app/assets/p5.play.j');
        assert.equal(zipFiles['my-app/assets/p5.play.j'], P5_PLAY_JS_CONTENT);
      });

      it('should contain a gamelab-api.js file', function() {
        assert.property(zipFiles, 'my-app/assets/gamelab-api.j');
        assert.equal(
          zipFiles['my-app/assets/gamelab-api.j'],
          `${WEBPACK_RUNTIME_JS_CONTENT}\n${GAMELAB_API_MIN_JS_CONTENT}`
        );
      });

      it('should contain a gamelab.css file', function() {
        assert.property(zipFiles, 'my-app/assets/gamelab.css');
        assert.equal(
          zipFiles['my-app/assets/gamelab.css'],
          GAMELAB_CSS_CONTENT
        );
      });

      describe('the index.html file', () => {
        let el;
        beforeEach(() => {
          el = document.createElement('html');
          el.innerHTML = zipFiles['my-app/assets/index.html'];
        });

        it('should have a #sketch element', () => {
          assert.isNotNull(el.querySelector('#sketch'), 'no #sketch element');
        });

        it('should have a #soft-buttons element', () => {
          assert.isNotNull(
            el.querySelector('#soft-buttons'),
            'no #soft-buttons element'
          );
        });

        it('should have a #studio-dpad-container element', () => {
          assert.isNotNull(
            el.querySelector('#studio-dpad-container'),
            'no #studio-dpad-container element'
          );
        });
      });

      it('should contain a code.js file', function() {
        assert.property(zipFiles, 'my-app/assets/code.j');
      });

      it('should contain the asset files used by the project', function() {
        assert.property(zipFiles, 'my-app/assets/foo.png');
        assert.property(zipFiles, 'my-app/assets/bar.png');
        assert.property(zipFiles, 'my-app/assets/zoo.mp3');
      });

      it('should contain the sound library files referenced by the project', function() {
        assert.property(zipFiles, 'my-app/assets/default.mp3');
      });

      it('should rewrite urls in the code to point to the correct asset files', function() {
        expect(zipFiles['my-app/assets/code.j']).to.include(
          'console.log("hello");\nplaySound("zoo.mp3");\nplaySound("default.mp3");'
        );
      });
    });
  });

  describe('globally exposed functions', () => {
    beforeEach(() => {
      // webpack-runtime must appear exactly once on any page containing webpack entries.
      require('../../../build/package/js/webpack-runtime.js');
      require('../../../build/package/js/gamelab-api.js');
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

  describe('Regression tests', () => {
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
