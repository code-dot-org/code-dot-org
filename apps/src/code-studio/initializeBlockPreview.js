function update(blockSpace, container, editor) {
  try {
    // populate with new xml; because we do this every time the editor
    // updates, there is the potential for many different kinds of
    // errors here as we will end up updating as the levelbuilder is
    // typing out the new content. Because of that and the fact that
    // this is simply an informative but not functional view, we simply
    // catch and ignore all errors.
    var xml = Blockly.Xml.textToDom(editor.getValue());
    blockSpace.clear();
    Blockly.Xml.domToBlockSpace(blockSpace, xml);
  } catch (e) {
    return;
  }

  // resize
  var metrics = blockSpace.getMetrics();
  var height = metrics.contentHeight + metrics.contentTop;
  container.style.height = height + "px";
  blockSpace.blockSpaceEditor.svgResize();
}

module.exports = function (editor, container) {
  var xml = Blockly.Xml.textToDom(editor.getValue() || "<xml></xml>");
  var blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(container, xml, {
    noScrolling: true
  });

  editor.on('update', function () {
    update(blockSpace, container, editor);
  });

  // need to update twice initially to counter Blockly's weird sizing
  // requirements
  update(blockSpace, container, editor);
  update(blockSpace, container, editor);
};
