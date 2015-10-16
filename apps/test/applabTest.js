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
var applabCommands = require('@cdo/apps/applab/commands');

describe('applab: designMode.addScreenIfNecessary', function () {
  it ('adds a screen if we dont have one', function () {
    var html =
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
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
      '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" tabindex="1" style="width: 320px; height: 480px;">' +
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

describe('applab: getIdDropdown filtering modes', function () {
  var documentRoot;

  beforeEach(function () {
    // Create a sample DOM to test against
    var sampleDom =
        '<div>' +
          '<div id="divApplab">' +
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

describe('getText/setText commands', function () {
  describe('simplified innerText emulation', function () {
    var getInnerText = applabCommands.getElementInnerText_;
    var setInnerText = applabCommands.setElementInnerText_;
    var element;

    beforeEach(function () {
      element = document.createElement('div');
      element.setAttribute("contentEditable", true);
    });

    describe('getter', function () {
      it('reads plain text as-is', function () {
        element.innerHTML = 'plain text';
        assert.equal(getInnerText(element), 'plain text');
      });

      it('converts nonbreaking spaces to plain spaces', function () {
        element.innerHTML = 'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace';
        assert.equal(getInnerText(element), 'text with  lots   of    whitespace');

        element.innerHTML = 'consecutive&nbsp;&nbsp;&nbsp;&nbsp;nonbreaking spaces';
        assert.equal(getInnerText(element), 'consecutive    nonbreaking spaces');
      });

      it('converts divs to newlines', function () {
        element.innerHTML = 'text<div>with</div><div>newlines</div>';
        assert.equal(getInnerText(element), 'text\nwith\nnewlines');
      });

      it('converts <div><br></div> to blank lines', function () {
        element.innerHTML = 'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>';
        assert.equal(getInnerText(element), 'text\n\nwith\n\n\nempty newlines');
      });

      it('does not add leading newline for leading nonempty div', function () {
        element.innerHTML = '<div>text</div><div>with</div><div>leading div</div>';
        assert.equal(getInnerText(element), 'text\nwith\nleading div');
      });

      it('does add leading newline for leading empty div', function () {
        element.innerHTML = '<div><br></div><div>text</div><div>with</div><div>leading empty div</div>';
        assert.equal(getInnerText(element), '\n\ntext\nwith\nleading empty div');
      });

      it('Unescapes < and >', function () {
        element.innerHTML = 'text with &lt;b&gt;markup&lt;/b&gt;';
        assert.equal(getInnerText(element), 'text with <b>markup</b>');
      });

      it('Unescapes &', function () {
        element.innerHTML = 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;';
        assert.equal(getInnerText(element), 'text with&nbsp;HTML &lt;escapes&gt;');
      });
    });

    describe('setter', function () {
      it('sets plain text as-is', function () {
        setInnerText(element, 'plain text');
        assert.equal(element.innerHTML, 'plain text');
      });

      it('adds nonbreaking spaces for extra whitespace', function () {
        setInnerText(element, 'text with  lots   of    whitespace');
        assert.equal(element.innerHTML, 'text with &nbsp;lots &nbsp; of &nbsp; &nbsp;whitespace');
      });

      it('adds divs for lines after the first line', function () {
        setInnerText(element, 'text\nwith\nnewlines');
        assert.equal(element.innerHTML, 'text<div>with</div><div>newlines</div>');
      });

      it('adds divs containing <br> for empty lines', function () {
        setInnerText(element, 'text\n\nwith\n\n\nempty newlines');
        assert.equal(element.innerHTML, 'text<div><br></div><div>with</div><div><br></div><div><br></div><div>empty newlines</div>');
      });

      it('html-escapes < and >', function () {
        setInnerText(element, 'text with <b>markup</b>');
        assert.equal(element.innerHTML, 'text with &lt;b&gt;markup&lt;/b&gt;');
      });

      it('html-escapes &', function () {
        setInnerText(element, 'text with&nbsp;HTML &lt;escapes&gt;');
        assert.equal(element.innerHTML, 'text with&amp;nbsp;HTML &amp;lt;escapes&amp;gt;');
      });
    });

    describe('round-trips', function () {
      function roundTripTest(text) {
        setInnerText(element, text);
        // One extra round-trip for good measure
        setInnerText(element, getInnerText(element));
        assert.equal(getInnerText(element), text);
      }

      it('preserves plain text', function () {
        roundTripTest('plain text');
      });

      it('preserves whitespace', function () {
        roundTripTest('text with  lots   of    whitespace');
      });

      it('preserves newlines', function () {
        roundTripTest('text\nwith\nnewlines');
      });

      it('preserves empty newlines', function () {
        roundTripTest('text\n\nwith\n\n\nempty newlines');
      });

      it('preserves leading and trailing newlines', function () {
        roundTripTest('\n\n\ntext between newlines\n\n');
      });

      it('preserves markup', function () {
        roundTripTest('text with <b>markup</b>');
      });

      it('preserves escape characters', function () {
        roundTripTest('text with&nbsp;HTML &lt;escapes&gt;');
      });
    });
  });
});
