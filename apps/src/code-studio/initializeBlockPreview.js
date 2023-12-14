function update(blockSpace, container, editor) {
  try {
    // Populate with new xml; because we do this every time the editor
    // updates, there is the potential for many different kinds of
    // errors here as we will end up updating as the levelbuilder is
    // typing out the new content. Because of that and the fact that
    // this is simply an informative but not functional view, we simply
    // catch and ignore all errors.
    blockSpace.clear();
    Blockly.cdoUtils.loadBlocksToWorkspace(
      blockSpace,
      Blockly.Xml.domToText(editor.getValue())
    );
  } catch (e) {
    return;
  }

  // resize
  var metrics = blockSpace.getMetrics();
  var height = metrics.contentHeight + metrics.contentTop;
  container.style.height = height + 'px';
  Blockly.cdoUtils.resizeSvg(blockSpace);
}

module.exports = function (editor, container) {
  var xml = Blockly.Xml.textToDom(editor.getValue() || '<xml></xml>');
  var blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(container, xml, {
    noScrolling: true,
  });

  editor.on('update', function () {
    update(blockSpace, container, editor);
  });

  update(blockSpace, container, editor);
};
