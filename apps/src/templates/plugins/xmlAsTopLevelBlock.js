/**
 * By default, and as per markdown standards, redactable markdown will not treat
 * XML blocks as top-level blocks, but will instead wrap all of them in
 * paragraph tags if they are not already in a paragraph.
 *
 * Unfortunately, we actually leverage that property of marked to allow us to
 * visually differentiate between inline and regular embedded Blockly blocks:
 * https://github.com/code-dot-org/code-dot-org/blob/9aed16a2e6b8aeaf3c97e6959f3ec62c61356024/apps/src/templates/instructions/utils.js#L76
 *
 * If we change how that's done, we can take away this plugin.
 */
module.exports =  function xmlAsTopLevelBlock() {
  this.Parser.prototype.options.blocks.push('xml');
};
