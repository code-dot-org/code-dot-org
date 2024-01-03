import {expect} from '../../../util/reconfiguredChai';
import {
  getPartitionedBlockElements,
  createBlockOrderMap,
  addMutationToMiniToolboxBlocks,
} from '@cdo/apps/blockly/addons/cdoXml';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';

const parser = new DOMParser();

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
    expect(partitionedBlockElements).to.deep.equal(expectedPartitionedElements);
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

describe('addMutationToMiniToolboxBlocks', function () {
  it('should add a mutation element with useDefaultIcon attribute to miniflyout block with "open" miniflyout', function () {
    // Sample mini-toolbox block XML
    const xmlData = `
      <block type="gamelab_spriteClicked" miniflyout="open" id="whenclicked">
        <field name="CONDITION">"when"</field>
        <value name="SPRITE">
          <block type="gamelab_allSpritesWithAnimation">
            <field name="ANIMATION">"face_strawberry_1"</field>
          </block>
        </value>
      </block>
    `;
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const blockElement = xmlDoc.documentElement;

    // Call the function
    addMutationToMiniToolboxBlocks(blockElement);

    // Find mutation element and useDefaultIcon attribute
    const expectedMutation = blockElement.querySelector('mutation');
    const expectedUseDefaultIcon =
      expectedMutation.getAttribute('useDefaultIcon');

    // Ensure that the mutation element is added and has the correct useDefaultIcon attribute.
    expect(expectedMutation).to.exist;
    // An open flyout will NOT use the default icon, since the default state is closed.
    expect(expectedUseDefaultIcon).to.equal('false');
    // Ensure that the miniflyout attribute is removed.
    expect(blockElement.getAttribute('miniflyout')).to.be.null;
  });

  it('should not add a mutation element to block without miniflyout attribute', function () {
    // Create a sample block element without miniflyout attribute
    const xmlData = '<block type="someBlock"></block>';
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const blockElement = xmlDoc.documentElement;

    // Make a copy of the original blockElement
    const originalBlockElement = blockElement.cloneNode(true);

    addMutationToMiniToolboxBlocks(blockElement);

    // Compare the modified blockElement with the original copy
    expect(blockElement.isEqualNode(originalBlockElement)).to.be.true;
  });
});
