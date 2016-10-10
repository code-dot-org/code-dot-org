import * as utils from '../utils';

export const FOOTER_HEIGHT = 30;
export const APP_WIDTH = 320;
export const APP_HEIGHT = 480;
export const DESIGN_ELEMENT_ID_PREFIX = 'design_';
export const ICON_PREFIX = 'icon://';
export const ICON_PREFIX_REGEX = new RegExp('^icon://');
export const NEW_SCREEN = "New screen...";
export const ApplabInterfaceMode = utils.makeEnum('CODE', 'DESIGN', 'DATA');
export const DataView = utils.makeEnum('OVERVIEW', 'PROPERTIES', 'TABLE');
export const ANIMATION_LENGTH_MS = 200;
export const IMPORT_SCREEN = "Import screen...";
