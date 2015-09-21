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
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');

describe("NetSimVizNode", function () {

  describe("defaults", function () {
    var vizNode;

    beforeEach(function () {
      vizNode = new NetSimVizNode();
    });

    it("is a VizElement", function () {
      assert(vizNode instanceof NetSimVizElement);
    });

    it("has default properties", function () {
      assert.equal(undefined, vizNode.address_);
      assert.equal(undefined, vizNode.dnsMode_);
      assert.equal(false, vizNode.isRouter);
      assert.equal(false, vizNode.isLocalNode);
      assert.equal(false, vizNode.isDnsNode);
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
