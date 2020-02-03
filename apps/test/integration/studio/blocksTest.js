import {assert} from '../../util/deprecatedChai';
import {parseElement} from '@cdo/apps/xml';
import {setupTestBlockly, getStudioAppSingleton} from '../util/testBlockly';
import blocksCommon from '@cdo/apps/blocksCommon';
import blocks from '@cdo/apps/studio/blocks';
import skins from '@cdo/apps/studio/skins';

describe('Custom studio blocks', function() {
  let studioApp, skin;

  beforeEach(function() {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();

    skin = skins.load(() => '', 'studio');
    blocksCommon.install(Blockly, {skin});
    blocks.install(Blockly, {skin});
  });

  describe('spriteAndGroupCollide', function() {
    it('defaults to witch', function() {
      studioApp.loadBlocks(
        '<xml><block type="studio_whenSpriteAndGroupCollide"></block></xml>'
      );
      assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

      var block = Blockly.mainBlockSpace.getAllBlocks()[0];
      var lastTitle = block.getTitles()[block.getTitles().length - 1];

      assert(block.getTitleValue('SPRITENAME') === '"witch"');
      assert(lastTitle.getText().indexOf('witch') !== -1);
    });

    it('updates text to match custom SPRITENAME', function() {
      studioApp.loadBlocks(
        '<xml>' +
          '<block type="studio_whenSpriteAndGroupCollide">' +
          '<title name="SPRITENAME">"dinosaur"</title>' +
          '</block>' +
          '</xml>'
      );
      assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

      var block = Blockly.mainBlockSpace.getAllBlocks()[0];
      var lastTitle = block.getTitles()[block.getTitles().length - 1];

      assert(block.getTitleValue('SPRITENAME') === '"dinosaur"');
      assert(lastTitle.getText().indexOf('dinosaur') !== -1);
    });
  });

  describe('conditional block code generation', function() {
    it('generates code for the if branch', function() {
      const xml = parseElement(`<block type="studio_ifActorIsSprite">
          <title name="SPRITE">0</title>
          <title name="VALUE">"hidden"</title>
          <statement name="DO">
            <block type="studio_setSpriteParams" inline="true">
              <title name="VALUE">"witch"</title>
              <value name="SPRITE">
                <block type="math_number">
                  <title name="NUM">1</title>
                </block>
              </value>
            </block>
          </statement>
        </block>`);
      const blocks = Blockly.Generator.xmlToBlocks('JavaScript', xml);
      const code = Blockly.JavaScript.blockToCode(blocks[0]);

      assert.include(code, 'Studio.setSprite');
    });

    it('generates code for the else branch', function() {
      const xml = parseElement(`<xml>
          <block type="when_run">
            <next>
              <block type="studio_ifActorIsSpriteElse">
                <title name="SPRITE">0</title>
                <title name="VALUE">"hidden"</title>
                <statement name="ELSE">
                  <block type="studio_setSpriteParams" inline="true">
                    <title name="VALUE">"witch"</title>
                    <value name="SPRITE">
                      <block type="math_number">
                        <title name="NUM">1</title>
                      </block>
                    </value>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </xml>`);
      const blocks = Blockly.Generator.xmlToBlocks('JavaScript', xml);
      const code = Blockly.JavaScript.blockToCode(blocks[0]);

      assert.include(code, 'Studio.setSprite');
    });
  });
});
