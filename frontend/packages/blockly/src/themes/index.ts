import * as Blockly from 'blockly/core';

import type {Theme} from '../types';

export const DARK_THEME_SUFFIX = 'dark';
export function isDarkTheme(theme: Blockly.Theme | undefined): boolean {
  return !!theme?.name.includes(DARK_THEME_SUFFIX);
}

import {default as darkTheme} from './dark';
import {default as defaultTheme} from './default';
import {default as deuteranopiaTheme} from './deuteranopia';
import {default as deuteranopiaDarkTheme} from './deuteranopiaDark';
import {default as highContrastTheme} from './highContrast';
import {default as highContrastDarkTheme} from './highContrastDark';
import {default as protanopiaTheme} from './protanopia';
import {default as protanopiaDarkTheme} from './protanopiaDark';
import {default as tritanopiaTheme} from './tritanopia';
import {default as tritanopiaDarkTheme} from './tritanopiaDark';

export const themes: {
  readonly [key: string]: Theme;
} = {
  [defaultTheme.definition.name]: defaultTheme,
  [darkTheme.definition.name]: darkTheme,
  [highContrastTheme.definition.name]: highContrastTheme,
  [highContrastDarkTheme.definition.name]: highContrastDarkTheme,
  [protanopiaTheme.definition.name]: protanopiaTheme,
  [protanopiaDarkTheme.definition.name]: protanopiaDarkTheme,
  [deuteranopiaTheme.definition.name]: deuteranopiaTheme,
  [deuteranopiaDarkTheme.definition.name]: deuteranopiaDarkTheme,
  [tritanopiaTheme.definition.name]: tritanopiaTheme,
  [tritanopiaDarkTheme.definition.name]: tritanopiaDarkTheme,
} as const;

export const themeOptions = [
  {
    value: defaultTheme.definition.name,
    text: defaultTheme.definition.option,
  },
  {
    value: highContrastTheme.definition.name,
    text: highContrastTheme.definition.option,
  },
  {
    value: protanopiaTheme.definition.name,
    text: protanopiaTheme.definition.option,
  },
  {
    value: deuteranopiaTheme.definition.name,
    text: deuteranopiaTheme.definition.option,
  },
  {
    value: tritanopiaTheme.definition.name,
    text: tritanopiaTheme.definition.option,
  },
] as const;

export {
  defaultTheme,
  darkTheme,
  highContrastTheme,
  highContrastDarkTheme,
  protanopiaTheme,
  protanopiaDarkTheme,
  deuteranopiaTheme,
  deuteranopiaDarkTheme,
  tritanopiaTheme,
  tritanopiaDarkTheme,
};
