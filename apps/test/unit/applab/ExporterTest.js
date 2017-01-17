/* global Promise dashboard */
import {assert} from '../../util/configuredChai';
import sinon from 'sinon';
var testUtils = require('../../util/testUtils');
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import {setAppOptions, getAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import Exporter, {getAppOptionsFile} from '@cdo/apps/applab/Exporter';
testUtils.setExternalGlobals();

describe('The Exporter,', function () {
  var server, listStub;

  beforeEach(function () {
    server = sinon.fakeServerWithClock.create();
    server.respondWith(
      /\/blockly\/js\/en_us\/common_locale\.js\?__cb__=\d+/,
      'common_locale.js content'
    );
    server.respondWith(
      /\/blockly\/js\/en_us\/applab_locale\.js\?__cb__=\d+/,
      'applab_locale.js content'
    );
    server.respondWith(
      /\/blockly\/js\/applab-api\.js\?__cb__=\d+/,
      'applab-api.js content'
    );
    server.respondWith(
      /\/blockly\/css\/applab\.css\?__cb__=\d+/,
      'applab.css content'
    );

    assetPrefix.init({channel: 'some-channel-id', assetPathPrefix: '/v3/assets/'});

    sinon.stub(dashboard.assets.listStore, 'list').returns([
      {filename: 'foo.png'},
      {filename: 'bar.png'},
      {filename: 'zoo.mp3'},
    ]);
    listStub = dashboard.assets.listStore.list;
    server.respondWith('/v3/assets/some-channel-id/foo.png', 'foo.png content');
    server.respondWith('/v3/assets/some-channel-id/bar.png', 'bar.png content');
    server.respondWith('/v3/assets/some-channel-id/zoo.mp3', 'zoo.mp3 content');

    setAppOptions({
      "levelGameName":"Applab",
      "skinId":"applab",
      "baseUrl":"/blockly/",
      "app":"applab",
      "droplet":true,
      "pretty":"",
      "level":{
        "skin":"applab",
        "editCode":true,
        "embed":false,
        "isK1":false,
        "isProjectLevel":true,
        "skipInstructionsPopup":false,
        "disableParamEditing":true,
        "disableVariableEditing":false,
        "useModalFunctionEditor":false,
        "useContractEditor":false,
        "contractHighlight":false,
        "contractCollapse":false,
        "examplesHighlight":false,
        "examplesCollapse":false,
        "definitionHighlight":false,
        "definitionCollapse":false,
        "freePlay":true,
        "appWidth":320,
        "appHeight":480,
        "sliderSpeed":1.0,
        "calloutJson":"[]",
        "disableExamples":false,
        "showTurtleBeforeRun":false,
        "autocompletePaletteApisOnly":false,
        "textModeAtStart":false,
        "designModeAtStart":false,
        "hideDesignMode":false,
        "beginnerMode":false,
        "levelId":"custom",
        "puzzle_number":1,
        "stage_total":1,
        "iframeEmbed":false,
        "lastAttempt":null,
        "submittable":false
      },
      "showUnusedBlocks":true,
      "fullWidth":true,
      "noHeader":true,
      "noFooter":true,
      "smallFooter":false,
      "codeStudioLogo":false,
      "hasI18n":false,
      "callouts":[],
      "channel":"Wc1JaBxTP04gGolQ9xuhNw",
      "readonlyWorkspace":true,
      "isLegacyShare":false,
      "postMilestone":true,
      "postFinalMilestone":true,
      "puzzleRatingsUrl":"/puzzle_ratings",
      "authoredHintViewRequestsUrl":"/authored_hint_view_requests.json",
      "serverLevelId":2176,
      "gameDisplayName":"App Lab",
      "publicCaching":false,
      "is13Plus":true,
      "hasContainedLevels":false,
      "hideSource":true,
      "share":true,
      "labUserId":"x+OhD4/hmGgtPrHVlrC32TFHAdo",
      "firebaseName":"cdo-v3-dev",
      "firebaseAuthToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJpYXQiOjE0ODM5OTg4MjksImQiOnsidWlkIjoiOTIiLCJpc19kYXNoYm9hcmRfdXNlciI6dHJ1ZX19.DX8PP0Q8EDGg7UtMbhT2sT-h39LvDsuuPbA6YesXLG8",
      "firebaseChannelIdSuffix":"-DEVELOPMENT-pcardune",
      "isSignedIn":true,
      "pinWorkspaceToBottom":true,
      "hasVerticalScrollbars":true,
      "showExampleTestButtons":true,
      "rackEnv":"development",
      "report":{
        "fallback_response":null,
        "callback":null,
        "sublevelCallback":null},
      "sendToPhone":true,
      "send_to_phone_url":"http://localhost-studio.code.org:3000/sms/send",
      "copyrightStrings":{
        "thank_you":"We%20thank%20our%20%3Ca%20href=%22https://code.org/about/donors%22%3Edonors%3C/a%3E,%20%3Ca%20href=%22https://code.org/about/partners%22%3Epartners%3C/a%3E,%20our%20%3Ca%20href=%22https://code.org/about/team%22%3Eextended%20team%3C/a%3E,%20our%20video%20cast,%20and%20our%20%3Ca%20href=%22https://code.org/about/advisors%22%3Eeducation%20advisors%3C/a%3E%20for%20their%20support%20in%20creating%20Code%20Studio.",
        "help_from_html":"We especially want to recognize the engineers from Google, Microsoft, Facebook, Twitter, and many others who helped create these materials.",
        "art_from_html":"Minecraft\u0026%238482;%20\u0026copy;%202017%20Microsoft.%20All%20Rights%20Reserved.%3Cbr%20/%3EStar%20Wars\u0026%238482;%20\u0026copy;%202017%20Disney%20and%20Lucasfilm.%20All%20Rights%20Reserved.%3Cbr%20/%3EFrozen\u0026%238482;%20\u0026copy;%202017%20Disney.%20All%20Rights%20Reserved.%3Cbr%20/%3EIce%20Age\u0026%238482;%20\u0026copy;%202017%2020th%20Century%20Fox.%20All%20Rights%20Reserved.%3Cbr%20/%3EAngry%20Birds\u0026%238482;%20\u0026copy;%202009-2017%20Rovio%20Entertainment%20Ltd.%20All%20Rights%20Reserved.%3Cbr%20/%3EPlants%20vs.%20Zombies\u0026%238482;%20\u0026copy;%202017%20Electronic%20Arts%20Inc.%20All%20Rights%20Reserved.%3Cbr%20/%3EThe%20Amazing%20World%20of%20Gumball%20is%20trademark%20and%20\u0026copy;%202017%20Cartoon%20Network.",
        "code_from_html":"Code.org%20uses%20p5.play,%20which%20is%20licensed%20under%20%3Ca%20href=%22http://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html%22%3Ethe%20GNU%20LGPL%202.1%3C/a%3E.",
        "powered_by_aws":"Powered by Amazon Web Services",
        "trademark":"\u0026copy;%20Code.org,%202017.%20Code.org\u0026reg;,%20the%20CODE%20logo%20and%20Hour%20of%20Code\u0026reg;%20are%20trademarks%20of%20Code.org."
      },
      "teacherMarkdown":null,
      "dialog":{
        "skipSound":false,
        "preTitle":null,
        "fallbackResponse":"null",
        "callback":null,
        "sublevelCallback":null,
        "app":"applab",
        "level":"custom",
        "shouldShowDialog":true
      },
      "locale":"en_us"
    });
  });

  afterEach(function () {
    server.restore();
    assetPrefix.init({});
    listStub.restore();
  });

  describe("when assets can't be fetched,", function () {
    beforeEach(function () {
      server.respondWith(/\/blockly\/js\/en_us\/common_locale\.js\?__cb__=\d+/, [500, {}, ""]);
    });

    it("should reject the promise with an error", function (done) {
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");',
        `<div>
          <div class="screen" tabindex="1" id="screen1">
            <input type="text" id="nameInput"/>
            <button id="clickMeButton" style="background-color: red;">Click Me!</button>
          </div>
        </div>`
      );
      server.respond();
      zipPromise.then(function () {
        assert.fail('Expected zipPromise not to resolve');
        done();
      }, function (error) {
        assert.equal(error.message, 'failed to fetch assets');
        done();
      });
    });
  });

  describe("when exporting,", function () {
    var zipFiles = {};
    beforeEach(function (done) {
      let zipPromise = Exporter.exportAppToZip(
        'my-app',
        'console.log("hello");\nplaySound("zoo.mp3");',
        `<div>
          <div class="screen" tabindex="1" id="screen1">
            <input type="text" id="nameInput"/>
            <img src="/v3/assets/some-channel-id/foo.png"/>
            <button id="iconButton" data-canonical-image-url="icon://fa-hand-peace-o">
            <button id="clickMeButton" style="background-color: red;">Click Me!</button>
          </div>
        </div>`
      );
      server.respond();

      zipPromise.then(function (zip) {
        var relativePaths = [];
        zip.forEach(function (relativePath, file) {
          relativePaths.push(relativePath);
        });
        var zipAsyncPromises = relativePaths.map(function (path) {
          var zipObject = zip.file(path);
          if (zipObject) {
            return zipObject.async("string");
          }
        });
        Promise.all(zipAsyncPromises)
          .then(function (fileContents) {
            relativePaths.forEach(function (path, index) {
              zipFiles[path] = fileContents[index];
            });
            done();
          }, done);
      }, done);
    });

    describe("will produce a zip file, which", function () {
      it("should contain an applab-api.js file", function () {
        assert.property(zipFiles, 'my-app/applab/applab-api.js');
        assert.equal(
          zipFiles['my-app/applab/applab-api.js'],
          `${getAppOptionsFile()}\ncommon_locale.js content\napplab_locale.js content\napplab-api.js content`
        );
      });

      it("should contain an applab.css file", function () {
        assert.property(zipFiles, 'my-app/applab/applab.css');
        assert.equal(zipFiles['my-app/applab/applab.css'], 'applab.css content');
      });

      it("should contain an index.html file", function () {
        assert.property(zipFiles, 'my-app/index.html');
        var el = document.createElement('html');
        el.innerHTML = zipFiles['my-app/index.html'];
        assert.isNotNull(el.querySelector("#divApplab"), "no #divApplab element");
        assert.equal(
          el.querySelector("#divApplab").innerText.trim(),
          'Click Me!',
          "#divApplab inner text"
        );
        assert.isNull(
          el.querySelector("#clickMeButton").getAttribute('style'),
          'style attributes should be removed'
        );
      });

      it("should contain a style.css file", function () {
        assert.property(zipFiles, 'my-app/style.css');
        assert.include(
          zipFiles['my-app/style.css'],
          '#divApplab #clickMeButton {\n' +
          '  background-color: red;\n' +
          '}'
        );
      });

      it("should contain a code.js file", function () {
        assert.property(zipFiles, 'my-app/code.js');
      });

      it("should contain a README.md file", function () {
        assert.property(zipFiles, 'my-app/README.md');
      });

      it("should contain the assets files used by the project", function () {
        assert.property(zipFiles, 'my-app/assets/foo.png');
        assert.property(zipFiles, 'my-app/assets/bar.png');
        assert.property(zipFiles, 'my-app/assets/zoo.mp3');
      });

      it("should rewrite urls in html to point to the correct asset files", function () {
        var el = document.createElement('html');
        el.innerHTML = zipFiles['my-app/index.html'];
        assert.equal(el.querySelector("img").getAttribute('src'), 'assets/foo.png');
      });

      it("should rewrite urls in the code to point to the correct asset files", function () {
        assert.equal(zipFiles['my-app/code.js'], 'console.log("hello");\nplaySound("assets/zoo.mp3");');
      });

    });

  });

  function runExportedApp(code, html, done) {
    let zipPromise = Exporter.exportAppToZip('my-app', code, html);
    server.respond();

    const relativePaths = [];
    return zipPromise.then(zip => {
      zip.forEach((relativePath, file) => relativePaths.push(relativePath));
      return Promise.all(relativePaths.map(path => {
        var zipObject = zip.file(path);
        if (zipObject) {
          return zipObject.async("string");
        }
      })).then(fileContents => {
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
        require('../../../build/package/js/applab-api.js');
        new Function(zipFiles['my-app/code.js'])();
        done();
      }).catch(e => {
        done(e);
      });
    });
  }

  describe("Regression tests", () => {
    it("should allow screens to be switched programmatically", (done) => {
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

    it("should allow you to use turtle operations", (done) => {
      runExportedApp(
        `moveForward(25);`,
        `<div><div class="screen" id="screen1" tabindex="1"></div></div>`,
        done
      );
    });
  });

});

describe("getAppOptionsFile helper function", () => {
  it("only exposes the app options that are whitelisted", () => {
    setAppOptions({
      puzzleRatingsUrl: "this should not show up",
      labUserId: "this should not show up",
      channel: 'this should be there',
      level: {
        isK1: "this should not show up",
        skin: "this should show up",
      },
      keyMissingFromWhitelist: 'should not show up',
    });
    assert.equal(
      getAppOptionsFile(),
      'window.APP_OPTIONS = {"level":{"skin":"this should show up"},"channel":"this should be there","readonlyWorkspace":true};'
    );
  });
});
