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
var NetSimVizWire = require('@cdo/apps/netsim/NetSimVizWire');

describe("NetSimVizWire", function () {
  var vizWire, localVizNode, remoteVizNode;

  describe("defaults", function () {
    beforeEach(function () {
      localVizNode = new NetSimVizNode();
      remoteVizNode = new NetSimVizNode();
      vizWire = new NetSimVizWire(localVizNode, remoteVizNode);
    });

    it("is a VizElement", function () {
      assert(vizWire instanceof NetSimVizElement);
    });

    it("has default properties", function () {
      assert.equal(0, vizWire.textPosX_);
      assert.equal(0, vizWire.textPosY_);
      assert.deepEqual([], vizWire.encodings_);
      assert(localVizNode === vizWire.localVizNode);
      assert(remoteVizNode === vizWire.remoteVizNode);
    });

    it("immediately creates SVG elements", function () {
      var root = vizWire.getRoot();
      assert.equal('[object SVGGElement]', root[0].toString());

      var rootChildren = root.children();
      assert.equal(3, rootChildren.length);

      var line = rootChildren[0];
      assert.equal('[object SVGPathElement]', line.toString());

      var questionMark = rootChildren[1];
      assert.equal('[object SVGTextElement]', questionMark.toString());

      var textBit = rootChildren[2];
      assert.equal('[object SVGTextElement]', textBit.toString());
    });
  });

});
