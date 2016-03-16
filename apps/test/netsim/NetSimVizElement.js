'use strict';
/* global describe, beforeEach, it */

var testUtils = require('../util/testUtils');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');

var assert = testUtils.assert;

testUtils.setupLocale('netsim');

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
      assert.isFalse(vizElement.isDying());
      assert.isFalse(vizElement.isDead());
    });

    it("immediately creates SVG root element", function () {
      var root = vizElement.getRoot();
      assert.equal('[object SVGGElement]', root[0].toString());
    });
  });

});
