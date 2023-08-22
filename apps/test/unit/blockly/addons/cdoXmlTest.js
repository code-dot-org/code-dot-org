import {expect} from '../../../util/reconfiguredChai';
import {
  getPartitionedBlockElements,
  createBlockOrderMap,
} from '@cdo/apps/blockly/addons/cdoXml';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';

const parser = new DOMParser();

describe('CdoXml', function () {
  describe('getPartitionedBlockElements', function () {
    it('should return partitioned block elements based on their types', function () {
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
      const partitionedBlockElements = getPartitionedBlockElements(
        xmlDoc.documentElement,
        PROCEDURE_DEFINITION_TYPES
      );

      // Expected partitioned block elements
      const expectedPartitionedElements = [
        xmlDoc.querySelector('block[type="procedures_defnoreturn"]'),
        xmlDoc.querySelector('block[type="blockType1"]'),
        xmlDoc.querySelector('block[type="blockType2"]'),
      ];

      // Compare the result with the expected partitioned elements
      expect(partitionedBlockElements).to.deep.equal(
        expectedPartitionedElements
      );
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
});
