import xml from '../xml';

/**
 * Generate xml for a functional definition
 * @param {string} name The name of the function
 * @param {string} outputType Function's output type
 * @param {Object<string, string>[]} argList Name and type for each arg
 * @param {string} blockXml Xml for the blocks that actually define the function
 */
export const functionalDefinitionXml = function (
  name,
  outputType,
  argList,
  blockXml
) {
  var mutation = '<mutation>';
  argList.forEach(function (argInfo) {
    mutation +=
      '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '<outputtype>' + outputType + '</outputtype></mutation>';

  return (
    '<block type="functional_definition" inline="false">' +
    mutation +
    '<field name="NAME">' +
    name +
    '</field>' +
    '<functional_input name="STACK">' +
    blockXml +
    '</functional_input>' +
    '</block>'
  );
};

/**
 * Generate xml for a calling a functional function
 * @param {string} name The name of the function
 * @param {Object<string, string>[]} argList Name and type for each arg
 */
export const functionalCallXml = function (name, argList, inputContents) {
  if (argList.length !== inputContents.length) {
    throw new Error('must define contents for each arg');
  }

  var mutation = '<mutation name="' + name + '">';
  argList.forEach(function (argInfo) {
    mutation +=
      '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '</mutation>';

  var contents = '';
  inputContents.forEach(function (blockXml, index) {
    contents +=
      '<functional_input name="ARG' +
      index +
      '">' +
      blockXml +
      '</functional_input>';
  });

  return '<block type="functional_call">' + mutation + contents + '</block>';
};

/**
 * Adds any functions from functionsXml to blocksXml. If a function with the
 * same id is already present in blocksXml, it won't be added again.
 */
export const appendNewFunctions = function (blocksXml, functionsXml) {
  const startBlocksDom = xml.parseElement(blocksXml);
  const sharedFunctionsDom = xml.parseElement(functionsXml);
  const functions = [...sharedFunctionsDom.ownerDocument.firstChild.childNodes];
  for (let func of functions) {
    let ownerDocument = func.ownerDocument.evaluate
      ? func.ownerDocument
      : document;
    let startBlocksDocument = startBlocksDom.ownerDocument.evaluate
      ? startBlocksDom.ownerDocument
      : document;
    const node = ownerDocument.evaluate(
      'field[@name="NAME"]',
      func,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    const name = node && node.id;
    const type = ownerDocument.evaluate(
      '@type',
      func,
      null,
      XPathResult.STRING_TYPE,
      null
    ).stringValue;
    const alreadyPresent =
      startBlocksDocument.evaluate(
        `//block[@type="${type}"]/field[@id="${name}"]`,
        startBlocksDom,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      ).snapshotLength > 0;
    if (!alreadyPresent) {
      startBlocksDom.ownerDocument.firstChild.appendChild(func);
    }
  }
  return xml.serialize(startBlocksDom);
};
