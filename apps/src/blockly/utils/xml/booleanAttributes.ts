type XmlAttribute = string | null;

// Considers an attribute true only if it is explicitly set to 'true' (i.e. defaults to false if unset).
export const FALSEY_DEFAULT = (attributeValue: XmlAttribute) =>
  attributeValue === 'true';

// Considers an attribute true unless it is explicitly set to 'false' (i.e. defaults to true if unset).
export const TRUTHY_DEFAULT = (attributeValue: XmlAttribute) =>
  attributeValue !== 'false';

/**
 * Reads a boolean attribute from an XML element and determines its value based on a callback function.
 * The callback function determines how we interpret the attribute value as a boolean.
 * @param {Element} xmlElement - The XML element from which to read the attribute.
 * @param {string} attribute - The name of the attribute to read from the XML element.
 * @param {function(string): boolean} [callback=FALSEY_DEFAULT] - A callback function that takes theattribute value as a string and returns a boolean.
 * @returns {boolean} The boolean value of the attribute as determined by the callback function.
 */
export function readBooleanAttribute(
  xmlElement: Element,
  attribute: string,
  callback: (attributeValue: XmlAttribute) => boolean = FALSEY_DEFAULT
) {
  const attributeValue = xmlElement.getAttribute(attribute);
  return callback(attributeValue);
}
