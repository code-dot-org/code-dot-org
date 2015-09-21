'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');

describe("NetSimVizElement", function () {

  describe("defaults", function () {
    var vizElement;

    beforeEach(function () {
      vizElement = new NetSimVizElement();
    });

    it("has default properties", function () {
      assert.equal(0, vizElement.posX);
      assert.equal(0, vizElement.posY);
      assert.equal(1, vizElement.scale);
      assert.deepEqual([], vizElement.tweens_);
      assert.equal(false, vizElement.isDying());
      assert.equal(false, vizElement.isDead());
    });

    it("immediately creates SVG root element", function () {
      var root = vizElement.getRoot();
      assert.equal('[object SVGGElement]', root[0].toString());
    });
  });

});
