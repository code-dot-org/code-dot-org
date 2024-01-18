import {expect} from '../../../util/reconfiguredChai';
import {
  addMutationToMiniToolboxBlocks,
  partitionXmlBlocksByType,
} from '@cdo/apps/blockly/addons/cdoXml';
import {PROCEDURE_DEFINITION_TYPES} from '@cdo/apps/blockly/constants';
const createBlockElement = data =>
  parser.parseFromString(data, 'text/xml').querySelector('block');

const parser = new DOMParser();

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

describe('partitionXmlBlocksByType', () => {
  it('should work with block elements and prioritized types', () => {
    const block1 = createBlockElement('<block type="blockType1"></block>');
    const block2 = createBlockElement(
      '<block type="procedures_defnoreturn"></block>'
    );
    const block3 = createBlockElement('<block type="blockType2"></block>');
    const blockElements = [block1, block2, block3];

    const result = partitionXmlBlocksByType(
      blockElements,
      PROCEDURE_DEFINITION_TYPES
    );
    expect(result).to.deep.equal([block2, block1, block3]);
  });

  it('should handle an empty block array', () => {
    const result = partitionXmlBlocksByType([], PROCEDURE_DEFINITION_TYPES);
    expect(result).to.deep.equal([]);
  });

  it('should handle undefined options', () => {
    const block1 = createBlockElement('<block type="C"></block>');
    const block2 = createBlockElement('<block type="B"></block>');
    const block3 = createBlockElement('<block type="A"></block>');

    const blockElements = [block1, block2, block3];

    const result = partitionXmlBlocksByType(blockElements);
    expect(result).to.deep.equal(blockElements);
  });
});
