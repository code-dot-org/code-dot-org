import Blockly from '@code-dot-org/blockly';

const original_Blockly_BlockSvg_prototype_renderDraw_ =
  Blockly.BlockSvg.prototype.renderDraw_;

Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  const ret = original_Blockly_BlockSvg_prototype_renderDraw_.apply(
    this,
    arguments
  );

  // Fix a problem in jigsaw_ blocks
  if (Blockly.RTL && this.block_.type.startsWith('jigsaw_')) {
    const path_blocks = this.getRootElement().getElementsByClassName(
      'blocklyPath'
    );
    for (const path_block of path_blocks) {
      path_block.setAttribute('transform', 'scale(-1 1)');
    }

    const rect_blocks = this.getRootElement().parentElement.querySelectorAll(
      'rect'
    );
    for (const rect_block of rect_blocks) {
      var current_transform = rect_block.getAttribute('transform');
      if (!current_transform.includes(' scale(-1 1)')) {
        rect_block.setAttribute(
          'transform',
          current_transform + ' scale(-1 1)'
        );
      }
    }
  }

  return ret;
};

window.Blockly = Blockly;
