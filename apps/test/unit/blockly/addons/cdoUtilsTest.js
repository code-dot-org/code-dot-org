import {expect} from '../../../util/reconfiguredChai';
import {partitionBlocksByType} from '@cdo/apps/blockly/addons/cdoUtils';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';

const parser = new DOMParser();

describe('CdoUtils', function () {
  describe('partitionBlocksByType', function () {
    it('should partition block elements based on their types', function () {
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
      const partitionedBlockElements = partitionBlocksByType(
        blockElementsCopy,
        PROCEDURE_DEFINITION_TYPES
      );

      // Expected partitioned block elements
      const expectedPartitionedElements = [
        blockElements[1],
        blockElements[0],
        blockElements[2],
      ];

      // Compare the result with the expected partitioned elements
      expect(partitionedBlockElements).to.deep.equal(
        expectedPartitionedElements
      );
    });
  });
});
