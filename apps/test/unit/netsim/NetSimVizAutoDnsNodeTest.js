import {assert} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimVizAutoDnsNode = require('@cdo/apps/netsim/NetSimVizAutoDnsNode');
var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');
var NetSimVizNode = require('@cdo/apps/netsim/NetSimVizNode');

var NetSimTestUtils = require('../../util/netsimTestUtils');

describe('NetSimVizAutoDnsNode', function () {
  var vizElement;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe('defaults', function () {
    beforeEach(function () {
      vizElement = new NetSimVizAutoDnsNode();
    });

    it('is a VizElement', function () {
      assert.instanceOf(vizElement, NetSimVizElement);
    });

    it('is a VizNode', function () {
      assert.instanceOf(vizElement, NetSimVizNode);
    });

    it('uses a DNS display name (by default)', function () {
      assert.equal('DNS', vizElement.displayName_.text());
    });

    it('uses a dns hostname when level expects it', function () {
      NetSimGlobals.getLevelConfig().showHostnameInGraph = true;
      vizElement = new NetSimVizAutoDnsNode();
      assert.equal('dns', vizElement.displayName_.text());
    });

    it("knows it's not a router", function () {
      assert.isFalse(vizElement.isRouter);
    });

    it("knows it's not a local node", function () {
      assert.isFalse(vizElement.isLocalNode);
    });

    it('knows it is a DNS node', function () {
      assert.isTrue(vizElement.isDnsNode);
    });

    it("adds the 'auto-dns-node' class to its root element", function () {
      assert.isTrue(vizElement.getRoot().is('.auto-dns-node'));
    });
  });
});
