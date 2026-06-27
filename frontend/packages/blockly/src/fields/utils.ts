/**
 * Shared utilities for Blockly fields.
 */

import * as Blockly from 'blockly/core';

/**
 * Gets a CSS variable value from the document body.
 */
export const getCSSVariable = (name: string): string =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

/**
 * Gets the current site theme from the workspace's injection div.
 */
export const getWorkspaceTheme = (
  workspace: Blockly.WorkspaceSvg | undefined,
): string =>
  workspace
    ?.getInjectionDiv()
    ?.closest('[data-theme]')
    ?.getAttribute('data-theme') || 'Dark';

/**
 * Default dropdown styles applied to React field editors.
 */
export const defaultDropdownStyles: React.CSSProperties = {
  color: getCSSVariable('neutral-gray-5') || '#f5f5f5',
  backgroundColor: getCSSVariable('neutral-gray-99') || '#1a1a1a',
  padding: '5px',
  width: 'auto',
};

/**
 * Measures the width of text using Blockly's fast text measurement.
 *
 * @param text - The text to measure
 * @param fontSize - Font size in points (e.g., 9.75 for 13px)
 * @param constants - Blockly's rendering constants
 * @returns The width of the text in pixels
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  constants: Blockly.blockRendering.ConstantProvider | null,
): number {
  // Create a temporary text element for measurement
  const textElement = Blockly.utils.dom.createSvgElement<SVGTextElement>(
    'text',
    {},
  );
  textElement.classList.add('blocklyText');
  textElement.appendChild(document.createTextNode(text));

  return Blockly.utils.dom.getFastTextWidth(
    textElement,
    fontSize,
    constants?.FIELD_TEXT_FONTWEIGHT || '',
    constants?.FIELD_TEXT_FONTFAMILY || '',
  );
}

/**
 * Creates an SVG text element with common field styling.
 *
 * @param text - The text content
 * @param x - X position
 * @param y - Y position
 * @param options - Additional options
 * @returns The created SVG text element
 */
export function createFieldText(
  text: string,
  x: number,
  y: number,
  options: {
    fill?: string;
    fontSize?: string;
    fontStyle?: string;
    fontFamily?: string;
    className?: string;
  } = {},
): SVGTextElement {
  const textElement = Blockly.utils.dom.createSvgElement<SVGTextElement>(
    'text',
    {
      fill: options.fill || getCSSVariable('neutral-gray-5'),
      x,
      y,
    },
  );

  textElement.classList.add('blocklyText');
  if (options.className) {
    textElement.classList.add(options.className);
  }

  if (options.fontSize) {
    textElement.style.fontSize = options.fontSize;
  }
  if (options.fontStyle) {
    textElement.style.fontStyle = options.fontStyle;
  }
  if (options.fontFamily) {
    textElement.style.fontFamily = options.fontFamily;
  }

  textElement.appendChild(document.createTextNode(text));
  return textElement;
}

/**
 * Creates an SVG icon element using Font Awesome.
 *
 * @param iconCode - The Font Awesome icon unicode (e.g., '\uf001')
 * @param x - X position
 * @param y - Y position
 * @param options - Additional options
 * @returns The created SVG text element for the icon
 */
export function createFieldIcon(
  iconCode: string,
  x: number,
  y: number,
  options: {
    fill?: string;
    fontSize?: string;
    className?: string;
  } = {},
): SVGTextElement {
  const iconElement = Blockly.utils.dom.createSvgElement<SVGTextElement>(
    'text',
    {
      fill: options.fill || getCSSVariable('neutral-gray-5'),
      x,
      y,
    },
  );

  iconElement.style.fontFamily = '"Font Awesome 6 Pro"';
  iconElement.style.fontSize = options.fontSize || '13px';

  if (options.className) {
    iconElement.classList.add(options.className);
  }

  iconElement.appendChild(document.createTextNode(iconCode));
  return iconElement;
}
