/* global Promise */
var sinon = require('sinon');
var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

var Exporter = require('@cdo/apps/applab/Exporter');

describe('The Exporter,', function () {
  var zipPromise, server;

  before(function () {
    server = sinon.fakeServerWithClock.create();
    server.respondWith('/assets/js/en_us/common_locale.js', 'common_locale.js content');
    server.respondWith('/assets/js/en_us/applab_locale.js', 'applab_locale.js content');
    server.respondWith('/assets/js/applab-api.js', 'applab-api.js content');
    server.respondWith('/assets/css/applab.css', 'applab.css content');
  });

  after(function () {
    server.restore();
  });

  describe("when exporting,", function () {
    var zipFiles = {};
    beforeEach(function (done) {
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
      });
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
        assert.equal(zipFiles['my-app/code.js'], 'console.log("hello");');
      });

      it("should contain a README.md file", function () {
        assert.property(zipFiles, 'my-app/README.md');
      });
    });

  });

});
