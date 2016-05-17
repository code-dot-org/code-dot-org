/* global Promise dashboard */
import {assert} from '../../util/configuredChai';
import sinon from 'sinon';
var testUtils = require('../../util/testUtils');
var assetPrefix = require('@cdo/apps/assetManagement/assetPrefix');

testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

var Exporter = require('@cdo/apps/applab/Exporter');

describe('The Exporter,', function () {
  var zipPromise, server;

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
    server.respondWith('/v3/assets/some-channel-id/foo.png', 'foo.png content');
    server.respondWith('/v3/assets/some-channel-id/bar.png', 'bar.png content');
    server.respondWith('/v3/assets/some-channel-id/zoo.mp3', 'zoo.mp3 content');
  });

  afterEach(function () {
    server.restore();
    dashboard.assets.listStore.list.restore();
  });

  describe("when assets can't be fetched,", function () {
    beforeEach(function () {
      server.respondWith(/\/blockly\/js\/en_us\/common_locale\.js\?__cb__=\d+/, [500, {}, ""]);
    });

    it("should reject the promise with an error", function (done) {
      zipPromise = Exporter.exportAppToZip(
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
      zipPromise = Exporter.exportAppToZip(
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
      it("should contain an applab.js file", function () {
        assert.property(zipFiles, 'my-app/applab.js');
        assert.equal(
          zipFiles['my-app/applab.js'],
          'common_locale.js content\napplab_locale.js content\napplab-api.js content'
        );
      });

      it("should contain an applab.css file", function () {
        assert.property(zipFiles, 'my-app/applab.css');
        assert.equal(zipFiles['my-app/applab.css'], 'applab.css content');
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

});
