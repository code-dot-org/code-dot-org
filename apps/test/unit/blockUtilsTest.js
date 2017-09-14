import { cleanBlocks } from '@cdo/apps/block_utils';
import { parseElement, serialize } from '@cdo/apps/xml.js';
import { expect } from '../util/configuredChai';

describe('block utils', () => {
  describe('cleanBlocks', () => {
    let cleanDom;
    beforeEach(() => {
      cleanDom = parseElement(`
        <xml>
          <block type="jump_to_xy">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`).ownerDocument;
    });

    it('does nothing to blocks without unwanted attributes', () => {
      const before = serialize(cleanDom);

      cleanBlocks(cleanDom);

      expect(serialize(cleanDom)).to.equal(before);
    });

    it('removes uservisible="false" from blocks', () => {
      const blocksDom = parseElement(`
        <xml>
          <block type="jump_to_xy" uservisible="false">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`
      ).ownerDocument;

      cleanBlocks(blocksDom);

      expect(serialize(blocksDom)).to.equal(serialize(cleanDom));
    });
  });
});
