import { expect } from '../../../util/configuredChai';
import { parseElement } from '@cdo/apps/xml';
import { convertBlocksXml } from '@cdo/apps/craft/code-connection/utils';

const normalizeWhitespace = function (xmlString) {
  return xmlString.replace(/\n\s*/g, "\n");
};

describe('convertBlocksXml', () => {
  it('can convert between differing block types', () => {
    const sources = [
      `<xml>
        <block type="craft_moveForward">
        </block>
      </xml>`,
      `<xml>
        <block type="craft_moveBackward">
        </block>
      </xml>`,
      `<xml>
        <block type="craft_destroyBlock">
        </block>
      </xml>`,
      `<xml>
        <block type="craft_whileBlockAhead">
          <title name="TYPE">dirt</title>
        </block>
      </xml>`,
    ];

    const expected = [
      `<xml>
        <block type="craft_move">
          <title name="DIR">forward</title>
        </block>
      </xml>`,
      `<xml>
        <block type="craft_move">
          <title name="DIR">back</title>
        </block>
      </xml>`,
      `<xml>
        <block type="craft_destroy">
          <title name="DIR">forward</title>
        </block>
      </xml>`,
      `<xml>
        <block type="controls_whileUntil" inline="false">
          <title name="MODE">WHILE</title>
          <value name="BOOL">
            <block type="logic_compare" inline="true">
              <title name="OP">EQ</title>
              <value name="A">
                <block type="craft_inspect">
                  <title name="DIR">forward</title>
                </block>
              </value>
              <value name="B">
                <block type="craft_getnameof" inline="false">
                  <value name="ITEM">
                    <block type="craft_block">
                      <title name="BLOCK">dirt</title>
                    </block>
                  </value>
                </block>
              </value>
            </block>
          </value>
        </block>
      </xml>`,
    ];

    sources.forEach((source, i) => {
      expect(normalizeWhitespace(convertBlocksXml(source))).to.equal(normalizeWhitespace(expected[i]));
    });
  });

  it('can convert minecraft block names when appropriate', () => {
    const blocks = [
      'dirt', // unconverted
      'oreCoal', // coal_ore
      'logAcacia', // log2,0
      'farmlandWet', // no code connection block, defaults to "dirt"
    ];

    const expected = [
      'dirt',
      'coal_ore',
      'log2,0',
      'dirt',
    ];

    blocks.forEach((block, i) => {
      const xml = `
        <xml>
          <block type="craft_whileBlockAhead">
            <title name="TYPE">${block}</title>
          </block>
        </xml>
      `;

      // We expect our title[name=TYPE] to turn in to a title[name=BLOCK]
      const result = parseElement(convertBlocksXml(xml));
      const titles = result.getElementsByTagName('title');
      let resultingBlock;
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].getAttribute("name") === "BLOCK") {
          resultingBlock = titles[i];
        }
      }

      expect(resultingBlock.textContent).to.equal(expected[i]);
    });
  });
});
