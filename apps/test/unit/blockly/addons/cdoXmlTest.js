import {expect} from '../../../util/reconfiguredChai';
import {
  sortBlocksByType,
  getSortedBlockElements,
  createBlockOrderMap,
} from '@cdo/apps/blockly/addons/cdoXml';
import {procedureDefinitionTypes} from '@cdo/apps/blockly/constants';

const parser = new DOMParser();

describe('sortBlocksByType', function () {
  it('should sort block elements based on their types', function () {
    // Sample block elements
    const blockData = [
      '<block type="blockType1"></block>',
      '<block type="procedures_defnoreturn"></block>',
      '<block type="blockType2"></block>',
    ];
    const blockElements = blockData.map(block => {
      return parser.parseFromString(block, 'text/xml').querySelector('block');
    });

    // Create a copy of the blockElements array
    const blockElementsCopy = [...blockElements];

    // Call the function
    const sortedBlockElements = sortBlocksByType(
      blockElementsCopy,
      procedureDefinitionTypes
    );

    // Expected sorted block elements
    const expectedSortedElements = [
      blockElements[1],
      blockElements[0],
      blockElements[2],
    ];

    // Compare the result with the expected sorted elements
    expect(sortedBlockElements).to.deep.equal(expectedSortedElements);
  });
});

describe('getSortedBlockElements', function () {
  it('should return sorted block elements based on their types', function () {
    // Sample XML data
    const xmlData = `
        <xml>
          <block type="blockType1"></block>
          <block type="procedures_defnoreturn"></block>
          <block type="blockType2"></block>
        </xml>
      `;
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    // Call the function
    const sortedBlockElements = getSortedBlockElements(
      xmlDoc.documentElement,
      procedureDefinitionTypes
    );

    // Expected sorted block elements
    const expectedSortedElements = [
      xmlDoc.querySelector('block[type="procedures_defnoreturn"]'),
      xmlDoc.querySelector('block[type="blockType1"]'),
      xmlDoc.querySelector('block[type="blockType2"]'),
    ];

    // Compare the result with the expected sorted elements
    expect(sortedBlockElements).to.deep.equal(expectedSortedElements);
  });
});

describe('createBlockOrderMap', function () {
  it('should create a block order map for the given XML', function () {
    // Sample XML data
    const xmlData = `
            <xml>
              <block type="blockType1"></block>
              <block type="procedures_defnoreturn"></block>
              <block type="blockType2"></block>
            </xml>
          `;
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    // Call the function
    const blockOrderMap = createBlockOrderMap(xmlDoc.documentElement);

    // Expected block order map
    const expectedMap = new Map();
    expectedMap.set(1, 0);
    expectedMap.set(0, 1);
    expectedMap.set(2, 2);
    // Convert maps to arrays and compare
    const blockOrderMapArray = Array.from(blockOrderMap);
    const expectedMapArray = Array.from(expectedMap);

    // Compare the result with the expected map
    expect(blockOrderMapArray).to.deep.equal(expectedMapArray);
  });
});
