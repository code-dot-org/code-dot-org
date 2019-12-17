import {expect} from '../../../util/deprecatedChai';
import {parseElement} from '@cdo/apps/xml';
import {convertBlocksXml} from '@cdo/apps/craft/code-connection/utils';

const normalizeWhitespace = function(xmlString) {
  return xmlString.replace(/\n\s*/g, '\n');
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
      </xml>`
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
      </xml>`
    ];

    sources.forEach((source, i) => {
      expect(normalizeWhitespace(convertBlocksXml(source))).to.equal(
        normalizeWhitespace(expected[i])
      );
    });
  });

  it('can convert minecraft block names when appropriate', () => {
    const blocks = [
      'dirt', // unconverted
      'oreCoal', // coal_ore
      'logAcacia', // log2,0
      'farmlandWet' // no code connection block, defaults to "dirt"
    ];

    const expected = ['dirt', 'coal_ore', 'log2,0', 'dirt'];

    blocks.forEach((block, i) => {
      const xml = `
        <xml>
          <block type="craft_ifBlockAhead">
            <title name="TYPE">${block}</title>
          </block>
        </xml>
      `;

      // We expect our title[name=TYPE] to turn in to a title[name=BLOCK]
      const result = parseElement(convertBlocksXml(xml));
      const titles = result.getElementsByTagName('title');
      let resultingBlock;
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].getAttribute('name') === 'BLOCK') {
          resultingBlock = titles[i];
        }
      }

      expect(resultingBlock.textContent).to.equal(expected[i]);
    });
  });

  it('can convert placeBlock blockTypes to numeric slot ids', () => {
    const blocksToExpected = {
      bricks: '1',
      logAcacia: '7',
      wool_blue: '22',
      nonExistantBlock: '1' // default
    };

    Object.keys(blocksToExpected).forEach(block => {
      const expected = blocksToExpected[block];
      const xml = `
        <xml>
          <block type="craft_placeBlock">
            <title name="TYPE">${block}</title>
          </block>
        </xml>
      `;

      // We expect our title[name=TYPE] to turn in to a title[name=NUM]
      const result = parseElement(convertBlocksXml(xml));
      const titles = result.getElementsByTagName('title');
      let resultingBlock;
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].getAttribute('name') === 'NUM') {
          resultingBlock = titles[i];
        }
      }

      expect(resultingBlock.textContent).to.equal(expected);
    });
  });

  it('can convert placeBlockDirection directions', () => {
    const directions = ['forward', 'right', 'back', 'left'];

    directions.forEach((dirString, dirNumber) => {
      const xml = `
        <xml>
          <block type="craft_placeBlockDirection">
            <title name="TYPE">dirt</title>
            <title name="DIR">${dirNumber}</title>
          </block>
        </xml>
      `;

      const result = parseElement(convertBlocksXml(xml));
      const titles = result.getElementsByTagName('title');
      let resultingBlock;
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].getAttribute('name') === 'DIR') {
          resultingBlock = titles[i];
        }
      }

      expect(resultingBlock.textContent).to.equal(dirString);
    });
  });
});
