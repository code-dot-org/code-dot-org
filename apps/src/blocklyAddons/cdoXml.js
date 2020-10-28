export default function initializeBlocklyXml(blocklyWrapper) {
  // Aliasing Google's blockToDom() so that we can override it, but still be able
  // to call Google's blockToDom() in the override function.
  blocklyWrapper.Xml.originalBlockToDom = blocklyWrapper.Xml.blockToDom;
  blocklyWrapper.Xml.blockToDom = function(block, ignoreChildBlocks) {
    const blockXml = blocklyWrapper.Xml.originalBlockToDom(block);
    if (!block.canDisconnectFromParent_) {
      blockXml.setAttribute('can_disconnect_from_parent', false);
    }
    if (ignoreChildBlocks) {
      Blockly.Xml.deleteNext(blockXml);
    }
    return blockXml;
  };

  // Aliasing Google's domToBlock() so that we can override it, but still be able
  // to call Google's domToBlock() in the override function.
  blocklyWrapper.Xml.originalDomToBlock = blocklyWrapper.Xml.domToBlock;
  blocklyWrapper.Xml.domToBlock = function(xmlBlock, workspace) {
    const block = blocklyWrapper.Xml.originalDomToBlock(xmlBlock, workspace);
    const can_disconnect_from_parent = xmlBlock.getAttribute(
      'can_disconnect_from_parent'
    );
    if (can_disconnect_from_parent) {
      block.canDisconnectFromParent_ = can_disconnect_from_parent === 'true';
    }
    return block;
  };

  blocklyWrapper.Xml.fieldToDom_ = function(field) {
    if (field.isSerializable()) {
      // Titles were renamed to fields in 2013, but CDO Blockly and
      // all existing student code uses titles, so to keep everything
      // consistent, we should continue using titles here.
      var container = Blockly.utils.xml.createElement('title');
      container.setAttribute('name', field.name || '');
      return field.toXml(container);
    }
    return null;
  };
  blocklyWrapper.Xml.domToBlockSpace = function(blockSpace, xml) {
    // Switch argument order
    return blocklyWrapper.Xml.domToWorkspace(xml, blockSpace);
  };
  blocklyWrapper.Xml.blockSpaceToDom = blocklyWrapper.Xml.workspaceToDom;
}
