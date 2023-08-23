import {expect} from '../../../util/reconfiguredChai';
import {partitionBlocksByType} from '@cdo/apps/blockly/addons/cdoUtils';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';

const parser = new DOMParser();
const createBlockElement = data =>
  parser.parseFromString(data, 'text/xml').querySelector('block');

describe('CdoUtils', () => {
  describe('partitionBlocksByType', () => {
    it('should work with JSON blocks and prioritized types', () => {
      const blocks = [
        {type: 'blockType1'},
        {type: 'when_run'},
        {type: 'blockType2'},
        {type: 'Dancelab_whenSetup'},
      ];
      const options = {
        prioritizedBlockTypes: ['when_run', 'Dancelab_whenSetup'],
        isJson: true,
      };

      const result = partitionBlocksByType(blocks, options);
      expect(result).to.deep.equal([
        {type: 'when_run'},
        {type: 'Dancelab_whenSetup'},
        {type: 'blockType1'},
        {type: 'blockType2'},
      ]);
    });

    it('should work with block elements and prioritized types', () => {
      const block1 = createBlockElement('<block type="blockType1"></block>');
      const block2 = createBlockElement(
        '<block type="procedures_defnoreturn"></block>'
      );
      const block3 = createBlockElement('<block type="blockType2"></block>');

      const blockElements = [block1, block2, block3];
      const options = {
        prioritizedBlockTypes: PROCEDURE_DEFINITION_TYPES,
        isJson: false,
      };

      const result = partitionBlocksByType(blockElements, options);
      expect(result).to.deep.equal([block2, block1, block3]);
    });

    it('should handle an empty block array', () => {
      const options = {
        prioritizedBlockTypes: PROCEDURE_DEFINITION_TYPES,
        isJson: false,
      };
      const result = partitionBlocksByType([], options);
      expect(result).to.deep.equal([]);
    });

    it('should return the original array if no prioritized types are provided', () => {
      const blocks = [{type: 'A'}, {type: 'B'}, {type: 'C'}];
      const options = {isJson: true};

      const result = partitionBlocksByType(blocks, options);
      expect(result).to.deep.equal(blocks);
    });

    it('should not thrown an error and default to using blockElements if isJson is not provided', () => {
      const block1 = createBlockElement('<block type="C"></block>');
      const block2 = createBlockElement('<block type="B"></block>');
      const block3 = createBlockElement('<block type="A"></block>');

      const blockElements = [block1, block2, block3];
      const options = {prioritizedBlockTypes: ['A']};

      const result = partitionBlocksByType(blockElements, options);
      expect(result).to.deep.equal([block3, block1, block2]);
    });

    it('should handle undefined options', () => {
      const block1 = createBlockElement('<block type="C"></block>');
      const block2 = createBlockElement('<block type="B"></block>');
      const block3 = createBlockElement('<block type="A"></block>');

      const blockElements = [block1, block2, block3];

      const result = partitionBlocksByType(blockElements);
      expect(result).to.deep.equal(blockElements);
    });
  });
});
