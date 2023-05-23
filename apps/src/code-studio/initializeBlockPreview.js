function update(blockSpace, container, editor) {
  try {
    // populate with new xml; because we do this every time the editor
    // updates, there is the potential for many different kinds of
    // errors here as we will end up updating as the levelbuilder is
    // typing out the new content. Because of that and the fact that
    // this is simply an informative but not functional view, we simply
    // catch and ignore all errors.
    var xml = Blockly.Xml.textToDom(editor.getValue());
    // console.log('editor', editor);
    // console.log('editor.getValue', editor.getValue());
    blockSpace.clear();
    Blockly.cdoUtils.loadBlocksToWorkspace(blockSpace, xml);
  } catch (e) {
    return;
  }

  // resize
  var metrics = blockSpace.getMetrics();
  // console.log('metrics', metrics);
  var height = metrics.contentHeight + metrics.contentTop;
  container.style.height = height + 'px';
  // console.log('blockSpace', blockSpace);
  // console.log('blockSpace.blockSpaceEditor', blockSpace.BlockSpaceEditor);
  if (Blockly.version === 'Google') {
    Blockly.svgResize(blockSpace);
  } else {
    blockSpace.blockSpaceEditor.svgResize();
  }
}

module.exports = function (editor, container) {
  var xml = Blockly.Xml.textToDom(editor.getValue() || '<xml></xml>');
  var blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(container, xml, {
    noScrolling: true,
  });

  editor.on('update', function () {
    update(blockSpace, container, editor);
  });

  // need to update twice initially to counter Blockly's weird sizing
  // requirements
  update(blockSpace, container, editor); // Error - Cannot read properties of undefined (reading 'svgResize')
  update(blockSpace, container, editor);
};
