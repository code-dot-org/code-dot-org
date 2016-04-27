'use strict';
/* globaldescribe, beforeEach, it */

var testUtils = require('../util/testUtils');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');

var assert = testUtils.assert;

testUtils.setupLocale('netsim');

describe("NetSimVizNode", function () {

  describe("defaults", function () {
    var vizNode;

    beforeEach(function () {
      vizNode = new NetSimVizNode();
    });

    it("is a VizElement", function () {
      assert.instanceOf(vizNode, NetSimVizElement);
    });

    it("has default properties", function () {
      assert.isUndefined(vizNode.address_);
      assert.isUndefined(vizNode.dnsMode_);
      assert.isFalse(vizNode.isRouter);
      assert.isFalse(vizNode.isLocalNode);
      assert.isFalse(vizNode.isDnsNode);
    });

    it("immediately creates SVG elements", function () {
      var root = vizNode.getRoot();
      assert.equal('[object SVGGElement]', root[0].toString());

      var rootChildren = root.children();
      assert.equal(3, rootChildren.length);

      var circle = rootChildren[0];
      assert.equal('[object SVGCircleElement]', circle.toString());

      var nameGroup = rootChildren[1];
      assert.equal('[object SVGGElement]', nameGroup.toString());
      var nameChildren = $(nameGroup).children();
      assert.equal(2, nameChildren.length);

      var addressGroup = rootChildren[2];
      assert.equal('[object SVGGElement]', addressGroup.toString());
      var addressChildren = $(addressGroup).children();
      assert.equal(2, addressChildren.length);
    });
  });

});
