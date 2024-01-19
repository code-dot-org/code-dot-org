import {expect} from '../../../util/reconfiguredChai';
import {addMutationToMiniToolboxBlocks} from '@cdo/apps/blockly/addons/cdoXml';

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
