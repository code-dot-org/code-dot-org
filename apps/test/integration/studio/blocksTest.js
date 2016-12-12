import {assert} from '../../util/configuredChai';
import {setupTestBlockly, getStudioAppSingleton} from '../util/testBlockly';
import blocks from '@cdo/apps/studio/blocks';
import skins from '@cdo/apps/studio/skins';

describe('Custom studio blocks', function () {
  var studioApp;

  beforeEach(function () {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();

    blocks.install(Blockly, {skin: skins.load(()=>'', 'studio')});
  });

  describe('spriteAndGroupCollide', function () {
    it('defaults to witch', function () {
      studioApp.loadBlocks('<xml><block type="studio_whenSpriteAndGroupCollide"></block></xml>');
      assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

      var block = Blockly.mainBlockSpace.getAllBlocks()[0];
      var lastTitle = block.getTitles()[block.getTitles().length - 1];

      assert(block.getTitleValue('SPRITENAME') === '"witch"');
      assert(lastTitle.getText().indexOf('witch') !== -1);
    });

    it('updates text to match custom SPRITENAME', function () {
      studioApp.loadBlocks('<xml>' +
        '<block type="studio_whenSpriteAndGroupCollide">' +
          '<title name="SPRITENAME">"dinosaur"</title>' +
        '</block>' +
      '</xml>');
      assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);

      var block = Blockly.mainBlockSpace.getAllBlocks()[0];
      var lastTitle = block.getTitles()[block.getTitles().length - 1];

      assert(block.getTitleValue('SPRITENAME') === '"dinosaur"');
      assert(lastTitle.getText().indexOf('dinosaur') !== -1);
    });
  });
});
