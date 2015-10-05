var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');

var $ = require('jquery');
var React = require('react');
window.$ = $;
window.jQuery = window.$;
window.React = React;

window.Applab = {
  appWidth: 320,
  appHeight: 480
};

var AppLab = require('@cdo/apps/applab/applab');
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

describe('getIdDropdown filtering modes', function () {
  var documentRoot;

  beforeEach(function () {
    // Create a sample DOM to test against
    var sampleDom =
        '<div>' +
          '<div id="divApplab" class="appModern">' +
            '<div class="screen" id="screen1">' +
              '<div class="chart" id="chart9"></div>' +
              '<img src="" class="chart-friend" id="image1">' +
            '</div>' +
          '</div>' +
        '</div>';
    documentRoot = $(sampleDom);
  });

  it('produces all IDs when no filter is given', function () {
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot), [
      { "display": '"chart9"', "text": '"chart9"' },
      { "display": '"image1"', "text": '"image1"' },
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
  });

  it('can filter on tag type', function () {
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, 'div'), [
      { "display": '"chart9"', "text": '"chart9"' },
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, 'img'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });

  it('can filter on class', function () {
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '.chart'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '.screen'), [
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
  });

  it('can filter on ID', function () {
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '#screen1'), [
      { "display": '"screen1"', "text": '"screen1"' }
    ]);
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '#chart9'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '#image1'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });

  it('does not accidentally pick up superset classes', function () {
    // Make sure searching for elements with class ".chart" does not also pick
    // up elements with class ".chart-friend"
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '.chart'), [
      { "display": '"chart9"', "text": '"chart9"' }
    ]);
    assert.deepEqual(AppLab.getIdDropdownFromDom_(documentRoot, '.chart-friend'), [
      { "display": '"image1"', "text": '"image1"' }
    ]);
  });
});