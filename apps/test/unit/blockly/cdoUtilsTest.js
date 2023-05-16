import {expect} from '../../util/reconfiguredChai';
import {compareBlockArrays} from '../../../src/blockly/addons/cdoUtils';

describe('compareBlockArrays', () => {
  const xmlBlocks = [
    {
      childBlocks_: [],
      deletable_: false,
      id: 'block1',
      inputList: [{sourceBlock_: null}],
      movable_: false,
      parentBlock_: null,
      styleName_: 'setup_blocks',
      type: 'test_setup_block',
      workspace: {},
      xy_: {x: 10, y: 10},
    },
    {
      childBlocks_: [],
      deletable_: true,
      id: 'block2',
      inputList: [],
      movable_: true,
      parentBlock_: null,
      styleName_: 'sprite_blocks',
      type: 'test_sprite_block',
      workspace: {},
      xy_: {x: 10, y: 100},
    },
  ];

  const jsonBlocks = [
    {
      childBlocks_: [],
      deletable_: false,
      id: 'block1',
      inputList: [{sourceBlock_: null}],
      movable_: false,
      parentBlock_: null,
      styleName_: 'setup_blocks',
      type: 'test_setup_block',
      workspace: {},
      xy_: {x: 10, y: 10},
    },
    {
      childBlocks_: [],
      deletable_: true,
      id: 'block2',
      inputList: [],
      movable_: true,
      parentBlock_: null,
      styleName_: 'sprite_blocks',
      type: 'test_sprite_block',
      workspace: {},
      xy_: {x: 10, y: 100},
    },
  ];

  const modifiedBlocks = [
    {
      childBlocks_: [],
      deletable_: true, // changed from false
      id: 'block1',
      inputList: [{sourceBlock_: null}],
      movable_: true, // changed from false
      parentBlock_: null,
      styleName_: 'setup_blocks',
      type: 'test_setup_block',
      workspace: {},
      xy_: {x: 10, y: 10},
    },
    {
      childBlocks_: [],
      deletable_: true,
      id: 'block2',
      inputList: [],
      movable_: true,
      parentBlock_: null,
      styleName_: 'sprite_blocks',
      type: 'test_sprite_block',
      workspace: {},
      xy_: {x: 0, y: 0}, // changed from {x: 10, y: 100}
    },
  ];

  it('should return empty array for identical block arrays', () => {
    expect(compareBlockArrays(xmlBlocks, jsonBlocks)).to.deep.equal([]);
  });

  it('should return differences for modified block arrays', () => {
    const differences = compareBlockArrays(xmlBlocks, modifiedBlocks);
    expect(differences.length).to.equal(4);

    expect(differences[0]).to.deep.equal({
      result: 'different values',
      path: '.0',
      key: 'deletable_',
      value1: false,
      value2: true,
    });
    expect(differences[1]).to.deep.equal({
      result: 'different values',
      path: '.0',
      key: 'movable_',
      value1: false,
      value2: true,
    });
    expect(differences[2]).to.deep.equal({
      result: 'different values',
      path: '.1.xy_',
      key: 'x',
      value1: 10,
      value2: 0,
    });
    expect(differences[3]).to.deep.equal({
      result: 'different values',
      path: '.1.xy_',
      key: 'y',
      value1: 100,
      value2: 0,
    });
  });

  it('should skip keysToSkip when comparing', () => {
    const xmlBlocksWithParent = [
      {
        childBlocks_: [],
        deletable_: true,
        id: 'block1',
        inputList: [{sourceBlock_: null}],
        movable_: true,
        parentBlock_: null,
        styleName_: 'setup_blocks',
        type: 'test_setup_block',
        workspace: {},
        xy_: {x: 10, y: 20},
      },
      {
        childBlocks_: [],
        deletable_: false,
        id: 'block2',
        inputList: [],
        movable_: true,
        styleName_: 'sprite_blocks',
        type: 'test_sprite_block',
        workspace: {},
        xy_: {x: 30, y: 40},
      },
    ];

    xmlBlocksWithParent[1].parentBlock_ = xmlBlocksWithParent[0]; // set parent to existing block in the array
    const jsonBlocksWithParent = [
      {
        childBlocks_: [],
        deletable_: true,
        id: 'block1',
        inputList: [{sourceBlock_: null}],
        movable_: true,
        parentBlock_: null,
        styleName_: 'setup_blocks',
        type: 'test_setup_block',
        workspace: {},
        xy_: {x: 10, y: 20},
      },
      {
        childBlocks_: [],
        deletable_: false,
        id: 'block2',
        inputList: [],
        movable_: true,
        styleName_: 'sprite_blocks',
        type: 'test_sprite_block',
        workspace: {},
        xy_: {x: 30, y: 40},
      },
    ];
    jsonBlocksWithParent[1].parentBlock_ = jsonBlocksWithParent[0]; // set parent to existing block in the array

    it('should skip keysToSkip when comparing', () => {
      const differences = compareBlockArrays(
        xmlBlocksWithParent,
        jsonBlocksWithParent
      );
      expect(differences).to.deep.equal([]);
    });
  });
});
