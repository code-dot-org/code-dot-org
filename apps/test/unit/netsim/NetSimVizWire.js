import {assert} from '../../util/reconfiguredChai';
import NetSimVizElement from '@cdo/apps/netsim/NetSimVizElement';
import NetSimVizNode from '@cdo/apps/netsim/NetSimVizNode';
import NetSimVizWire from '@cdo/apps/netsim/NetSimVizWire';

describe('NetSimVizWire', function () {
  var vizWire, localVizNode, remoteVizNode;

  describe('defaults', function () {
    beforeEach(function () {
      localVizNode = new NetSimVizNode();
      remoteVizNode = new NetSimVizNode();
      vizWire = new NetSimVizWire(localVizNode, remoteVizNode);
    });

    it('is a VizElement', function () {
      assert.instanceOf(vizWire, NetSimVizElement);
    });

    it('has default properties', function () {
      assert.strictEqual(0, vizWire.textPosX_);
      assert.strictEqual(0, vizWire.textPosY_);
      assert.deepEqual([], vizWire.encodings_);
      assert.strictEqual(localVizNode, vizWire.localVizNode);
      assert.strictEqual(remoteVizNode, vizWire.remoteVizNode);
    });

    it('immediately creates SVG elements', function () {
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
