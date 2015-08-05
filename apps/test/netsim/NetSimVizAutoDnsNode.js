'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimGlobals = require('@cdo/apps/netsim/netsimGlobals_renaming');
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

    it ("is a VizElement", function () {
      assert(vizElement instanceof NetSimVizElement);
    });

    it ("is a VizNode", function () {
      assert(vizElement instanceof NetSimVizNode);
    });

    it ("uses a DNS display name (by default)", function () {
      assertEqual('DNS', vizElement.displayName_.text());
    });

    it ("uses a dns hostname when level expects it", function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizAutoDnsNode();
      assertEqual('dns', vizElement.displayName_.text());
    });

    it ("knows it's not a router", function () {
      assertEqual(false, vizElement.isRouter);
    });

    it ("knows it's not a local node", function () {
      assertEqual(false, vizElement.isLocalNode);
    });

    it ("knows it is a DNS node", function () {
      assertEqual(true, vizElement.isDnsNode);
    });

    it ("adds the 'auto-dns-node' class to its root element", function () {
      assertEqual(true, vizElement.getRoot().is('.auto-dns-node'));
    });
  });

});
