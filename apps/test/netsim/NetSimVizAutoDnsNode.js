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

var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');
var NetSimVizAutoDnsNode = require('@cdo/apps/netsim/NetSimVizAutoDnsNode');

describe("NetSimVizAutoDnsNode", function () {
  var vizElement;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe("defaults", function () {
    beforeEach(function () {
      vizElement = new NetSimVizAutoDnsNode();
    });

    it("is a VizElement", function () {
      assert(vizElement instanceof NetSimVizElement);
    });

    it("is a VizNode", function () {
      assert(vizElement instanceof NetSimVizNode);
    });

    it("uses a DNS display name (by default)", function () {
      assert.equal('DNS', vizElement.displayName_.text());
    });

    it("uses a dns hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizAutoDnsNode();
      assert.equal('dns', vizElement.displayName_.text());
    });

    it("knows it's not a router", function () {
      assert.equal(false, vizElement.isRouter);
    });

    it("knows it's not a local node", function () {
      assert.equal(false, vizElement.isLocalNode);
    });

    it("knows it is a DNS node", function () {
      assert.equal(true, vizElement.isDnsNode);
    });

    it("adds the 'auto-dns-node' class to its root element", function () {
      assert.equal(true, vizElement.getRoot().is('.auto-dns-node'));
    });
  });

});
