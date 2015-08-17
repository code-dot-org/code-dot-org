var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');

var $ = require('jquery');
window.$ = $;
window.jQuery = window.$;

window.Applab = {
  appWidth: 320,
  appHeight: 480
};

var designMode = require('@cdo/apps/applab/designMode');

describe('designMode.addScreenIfNecessary', function () {
  it ('adds a screen if we dont have one', function () {
    var html =
      '<div xmlns="http://www.w3.org/1999/xhtml" id="divApplab" tabindex="1" style="width: 320px; height: 480px;" class="divApplabDesignMode">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 95px; top: 55px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
        '<button id="button2" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 100px; top: 160px; background-color: rgb(238, 238, 238);" class="">Button</button>' +
      '</div>';

    var converted = designMode.addScreenIfNecessary(html);
    var children = $(converted).children();
    assert.equal(children.length, 1);

    var screenObj = children.eq(0);
    assert.equal(screenObj.hasClass('screen'), true);
    assert.equal(screenObj.children().length, 2);
  });

  it('changes nothing if we already have a screen', function () {
    var html =
      '<div xmlns="http://www.w3.org/1999/xhtml" id="divApplab" tabindex="1" style="width: 320px; height: 480px;" class="divApplabDesignMode">' +
        '<div class="screen" id="screen1" style="display: block; height: 480px; width: 320px; left: 0px; top: 0px; position: relative;">' +
          '<button id="button1" class="" style="padding: 0px; margin: 0px; height: 40px; width: 80px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 120px; top: 75px; background-color: rgb(238, 238, 238);">Button</button>' +
        '</div>' +
      '</div>';

    var converted = designMode.addScreenIfNecessary(html);
    assert.equal(converted, html);
  });

  it('succeeds if we have no startHtml', function () {
    var html = '';
    var converted = designMode.addScreenIfNecessary(html);
    assert.equal(converted, html);
  });
});
