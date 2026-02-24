import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Exporter, {getAppOptionsFile} from '@cdo/apps/applab/Exporter';
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import {setAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import pageConstantsReducer, {
  setPageConstants,
} from '@cdo/apps/redux/pageConstants';

import {assert, expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const assets = require('@cdo/apps/code-studio/assets');

var testUtils = require('../../util/testUtils');

const WEBPACK_RUNTIME_JS_CONTENT = 'webpack-runtime.js content';
const COMMON_LOCALE_JS_CONTENT = 'common_locale.js content';
const APPLAB_LOCALE_JS_CONTENT = 'applab_locale.js content';
const APPLAB_API_JS_CONTENT = 'applab-api.js content';
const COMMON_CSS_CONTENT = `
body {
  font-family: sans-serif;
}`;
const APPLAB_CSS_CONTENT = `
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

const NEW_APPLAB_CSS_CONTENT = `
body {
  font-family: sans-serif;
}
.some-css-rule {
  background-image: url("assets/blockly/media/foo.png");
}
#some-other-rule {
  background-image: url("assets/blockly/media/bar.jpg");
}
a.third-rule {
  background-image: url("assets/blockly/media/third.jpg");
}
`;

const STYLE_CSS_CONTENT = `@font-face {
  font-family: 'FontAwesome';
  font-display: block;
  src: url("applab/fa-brands-400.woff2") format('woff2');
}
`;

const JQUERY_JS_CONTENT = 'jquery content';
const PNG_ASSET_CONTENT = 'asset content';
const FONTAWESOME_CONTENT = 'fontawesome content';

describe('Applab Exporter,', function () {
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
      /\/blockly\/js\/en_us\/common_locale\.js\?__cb__=\d+/,
      COMMON_LOCALE_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/js\/en_us\/applab_locale\.js\?__cb__=\d+/,
      APPLAB_LOCALE_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/js\/applab-api\.js\?__cb__=\d+/,
      APPLAB_API_JS_CONTENT
    );
    server.respondWith(
      /\/blockly\/css\/common\.css\?__cb__=\d+/,
      COMMON_CSS_CONTENT
    );
    server.respondWith(
      /\/blockly\/css\/applab\.css\?__cb__=\d+/,
      APPLAB_CSS_CONTENT
    );
    server.respondWith(
      'https://code.jquery.com/jquery-1.12.1.min.js',
      JQUERY_JS_CONTENT
    );
    server.respondWith(/\/webpack_output\/.*\.png/, PNG_ASSET_CONTENT);
    server.respondWith(
      /^https:\/\/dsco.code.org\/assets\/font-awesome-pro/,
      FONTAWESOME_CONTENT
    );
    server.respondWith(
      '/api/v1/sound-library/default.mp3',
      'default.mp3 content'
    );
    server.respondWith('https://studio.code.org/fakeRequest', '{}');

    assetPrefix.init({
      channel: 'some-channel-id',
      assetPathPrefix: '/v3/assets/',
    });

    assets.listStore.list.returns([
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

    // Needed to simulate fetch() response to '/projects/applab/fake_id/export_create_channel'
    sinon
      .stub(window, 'fetch')
      .returns(
        Promise.resolve(
          new Response(JSON.stringify({channel_id: 'new_fake_id'}))
        )
      );

    setAppOptions({
      levelGameName: 'Applab',
      skinId: 'applab',
      baseUrl: '/blockly/',
      app: 'applab',
      droplet: true,
      pretty: '',
      level: {
        skin: 'applab',
        editCode: true,
        embed: false,
        isK1: false,
        isProjectLevel: true,
        skipInstructionsPopup: false,
        disableParamEditing: true,
        disableVariableEditing: false,
        useModalFunctionEditor: false,
        useContractEditor: false,
        contractHighlight: false,
        contractCollapse: false,
        examplesHighlight: false,
        examplesCollapse: false,
        definitionHighlight: false,
        definitionCollapse: false,
        freePlay: true,
        appWidth: 320,
        appHeight: 480,
        sliderSpeed: 1.0,
        calloutJson: '[]',
        disableExamples: false,
        showTurtleBeforeRun: false,
        autocompletePaletteApisOnly: false,
        textModeAtStart: false,
        designModeAtStart: false,
        hideDesignMode: false,
        beginnerMode: false,
        levelId: 'custom',
        puzzle_number: 1,
        lesson_total: 1,
        iframeEmbed: false,
        lastAttempt: null,
        submittable: false,
        widgetMode: false,
      },
      showUnusedBlocks: true,
      fullWidth: true,
      noHeader: true,
      noFooter: true,
      smallFooter: false,
      codeStudioLogo: false,
      hasI18n: false,
      callouts: [],
      channel: 'Wc1JaBxTP04gGolQ9xuhNw',
      readonlyWorkspace: true,
      isLegacyShare: false,
      postMilestoneMode: true,
      puzzleRatingsUrl: '/puzzle_ratings',
      authoredHintViewRequestsUrl: '/authored_hint_view_requests.json',
      serverLevelId: 2176,
      gameDisplayName: 'App Lab',
      appName: 'Code.org',
      publicCaching: false,
      is13Plus: true,
      hasContainedLevels: false,
      hideSource: true,
      share: true,
      labUserId: 'x+OhD4/hmGgtPrHVlrC32TFHAdo',
      isSignedIn: true,
      pinWorkspaceToBottom: true,
      hasVerticalScrollbars: true,
      showExampleTestButtons: true,
      rackEnv: 'development',
      report: {
        fallback_response: null,
        callback: null,
        sublevelCallback: null,
      },
      isUS: true,
      send_to_phone_url: 'http://localhost-studio.code.org:3000/sms/send',
      teacherMarkdown: null,
      dialog: {
        skipSound: false,
        preTitle: null,
        fallbackResponse: 'null',
        callback: null,
        sublevelCallback: null,
        app: 'applab',
        level: 'custom',
        shouldShowDialog: true,
      },
      locale: 'en_us',
    });

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
    window.fetch.restore();
    assetPrefix.init({});
    window.userNameCookieKey = stashedCookieKey;
    restoreRedux();
  });

  describe("when assets can't be fetched,", function () {
    beforeEach(function () {
      server.respondWith(
        /\/blockly\/js\/en_us\/common_locale\.js\?__cb__=\d+/,
        [500, {}, '']
      );
    });

    it('should reject the promise with an error', function (done) {
      server.respondImmediately = true;
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");',
        `<div>
          <div class="screen" tabindex="1" id="screen1">
            <input id="nameInput"/>
            <button id="clickMeButton" style="background-color: red;">Click Me!</button>
          </div>
        </div>`
      );
      zipPromise.then(
        function () {
          assert.fail('Expected zipPromise not to resolve');
          done();
        },
        function (error) {
          assert.equal(error.message, 'failed to fetch assets');
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
        `<div>
          <div class="screen" tabindex="1" id="screen1">
            <input id="nameInput"/>
            <img id="firstImage" src="/v3/assets/some-channel-id/foo.png"/>
            <button id="iconButton" data-canonical-image-url="icon://fa-hand-peace-o">
            <button id="clickMeButton" style="background-color: red;">Click Me!</button>
            <button id="1Button" style="background-color: blue;">1</button>
            <img id="secondImage" src="/v3/assets/some-channel-id/foo.png"/>
          </div>
        </div>`
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
        assert.deepEqual(files, [
          'my-app/',
          'my-app/README.txt',
          'my-app/applab/',
          'my-app/applab/applab-api.js',
          'my-app/applab/applab.css',
          'my-app/applab/assets/',
          'my-app/applab/assets/blockly/',
          'my-app/applab/assets/blockly/media/',
          'my-app/applab/assets/blockly/media/bar.jpg',
          'my-app/applab/assets/blockly/media/foo.png',
          'my-app/applab/assets/blockly/media/third.jpg',
          'my-app/applab/fa-brands-400.woff2',
          'my-app/applab/fa-regular-400.woff2',
          'my-app/applab/fa-solid-900.woff2',
          'my-app/applab/fa-v4compatibility.woff2',
          'my-app/assets/',
          'my-app/assets/bar.png',
          'my-app/assets/default.mp3',
          'my-app/assets/foo.png',
          'my-app/assets/zoo.mp3',
          'my-app/code.js',
          'my-app/index.html',
          'my-app/style.css',
        ]);
      });

      it('should contain an applab-api.js file', function () {
        assert.property(zipFiles, 'my-app/applab/applab-api.js');
        assert.equal(
          zipFiles['my-app/applab/applab-api.js'],
          `${WEBPACK_RUNTIME_JS_CONTENT}\n${getAppOptionsFile()}\n${COMMON_LOCALE_JS_CONTENT}\n${APPLAB_LOCALE_JS_CONTENT}\n${APPLAB_API_JS_CONTENT}`
        );
      });

      it('should contain an applab.css file', function () {
        assert.property(zipFiles, 'my-app/applab/applab.css');
        assert.equal(
          zipFiles['my-app/applab/applab.css'],
          NEW_APPLAB_CSS_CONTENT
        );
      });

      describe('the index.html file', () => {
        let el;
        beforeEach(() => {
          el = document.createElement('html');
          el.innerHTML = zipFiles['my-app/index.html'];
        });

        it('should have a #divApplab element', () => {
          assert.isNotNull(
            el.querySelector('#divApplab'),
            'no #divApplab element'
          );
          const innerTextLines = el
            .querySelector('#divApplab')
            .textContent.trim()
            .split('\n');
          assert.equal(
            innerTextLines[0].trim(),
            'Click Me!',
            '#divApplab inner text first line'
          );
          assert.equal(
            innerTextLines[1].trim(),
            '1',
            '#divApplab inner text second line'
          );
        });
      });

      it('should contain a style.css file', function () {
        assert.property(zipFiles, 'my-app/style.css');
      });

      it('style.css should contain the fontawesome definition', () => {
        assert.include(zipFiles['my-app/style.css'], STYLE_CSS_CONTENT);
      });

      it('should contain a code.js file', function () {
        assert.property(zipFiles, 'my-app/code.js');
      });

      it('should contain a README.txt file', function () {
        assert.property(zipFiles, 'my-app/README.txt');
      });

      it('should contain the asset files used by the project', function () {
        assert.property(zipFiles, 'my-app/assets/foo.png');
        assert.property(zipFiles, 'my-app/assets/bar.png');
        assert.property(zipFiles, 'my-app/assets/zoo.mp3');
      });

      it('should contain the sound library files referenced by the project', function () {
        assert.property(zipFiles, 'my-app/assets/default.mp3');
      });

      it('should rewrite urls in html to point to the correct asset files', function () {
        var el = document.createElement('html');
        el.innerHTML = zipFiles['my-app/index.html'];
        assert.equal(
          el.querySelector('#firstImage').getAttribute('src'),
          'assets/foo.png'
        );
        assert.equal(
          el.querySelector('#secondImage').getAttribute('src'),
          'assets/foo.png'
        );
      });

      it('should rewrite urls in the code to point to the correct asset files', function () {
        assert.equal(
          zipFiles['my-app/code.js'],
          'console.log("hello");\nplaySound("assets/zoo.mp3");\nplaySound("assets/default.mp3");'
        );
      });
    });
  });

  function runExportedApp(code, html, done, globalPromiseName) {
    server.respondImmediately = true;
    let zipPromise = Exporter.exportAppToZip('my-app', code, html);

    const relativePaths = [];
    return zipPromise.then(zip => {
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

          new Function(getAppOptionsFile())();
          setAppOptions(Object.assign(window.APP_OPTIONS, {isExported: true}));
          // webpack-runtime must appear exactly once on any page containing webpack entries.
          require('../../../build/package/js/webpack-runtime.js');
          require('../../../build/package/js/applab-api.js');
          new Function(zipFiles['my-app/code.js'])();
          if (globalPromiseName) {
            await window[globalPromiseName];
          }
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  }

  // TODO: Address infinite loop caused by runExportedApp helper used in 'Regression tests' block.
  // See ticket for more details: https://codedotorg.atlassian.net/browse/STAR-2399
  describe.skip('Regression tests', () => {
    testUtils.sandboxDocumentBody();

    it('should allow screens to be switched programmatically', done => {
      runExportedApp(
        `console.log("before switch"); setScreen("screen2"); console.log("after switch");`,
        `<div>
            <div class="screen" tabindex="1" id="screen1">
            </div>
            <div class="screen" tabindex="1" id="screen2">
            </div>
          </div>`,
        done
      );
    });

    it('should allow you to use turtle operations', done => {
      runExportedApp(
        `moveForward(25);`,
        `<div><div class="screen" id="screen1" tabindex="1"></div></div>`,
        done
      );
    });

    it('should allow you to play a sound', done => {
      runExportedApp(
        `playSound("https://studio.code.org/blockly/media/example.mp3", false);`,
        `<div><div class="screen" id="screen1" tabindex="1"></div></div>`,
        done
      );
    });

    it('should allow you to use startWebRequest without the XHR proxy', done => {
      runExportedApp(
        `var webRequestPromise = new Promise(function (resolve, reject) {
            startWebRequest("https://studio.code.org/fakeRequest", function (status, type, content) {
              if (status === 200) {
                resolve(status);
              } else {
                reject(new Error('network error'));
              }
            });
          });`,
        `<div><div class="screen" id="screen1" tabindex="1"></div></div>`,
        done,
        'webRequestPromise'
      );
    });

    it('should run custom marshall methods', done => {
      sinon.spy(window, 'write');
      runExportedApp(
        `
          var a = 'abcdef'.split('');
          insertItem(a, 3, 'hi');
          write(a);
          `,
        `<div><div class="screen" id="screen1" tabindex="1"></div></div>`,
        () => {
          expect(window.write).toHaveBeenCalledWith([
            'a',
            'b',
            'c',
            'hi',
            'd',
            'e',
            'f',
          ]);
          done();
        }
      );
    });
  });
});

describe('getAppOptionsFile helper function', () => {
  it('only exposes the app options that are allowlisted', () => {
    setAppOptions({
      puzzleRatingsUrl: 'this should not show up',
      labUserId: 'this should not show up',
      channel: 'this should be there',
      level: {
        isK1: 'this should not show up',
        skin: 'this should show up',
      },
      keyMissingFromAllowlist: 'should not show up',
    });
    assert.equal(
      getAppOptionsFile(),
      'window.APP_OPTIONS = {"level":{"skin":"this should show up"},"channel":"this should be there","readonlyWorkspace":true};'
    );
  });
});
