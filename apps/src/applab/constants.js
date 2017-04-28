import * as utils from '../utils';
import {ICON_PREFIX, ICON_PREFIX_REGEX} from '../assetManagement/assetPrefix';

export {ICON_PREFIX, ICON_PREFIX_REGEX};
export const FOOTER_HEIGHT = 30;
export const APP_WIDTH = 320;
export const APP_HEIGHT = 480;
export const DESIGN_ELEMENT_ID_PREFIX = 'design_';
export const NEW_SCREEN = "New screen...";
export const ApplabInterfaceMode = utils.makeEnum('CODE', 'DESIGN', 'DATA');
export const ANIMATION_LENGTH_MS = 200;
export const IMPORT_SCREEN = "Import screen...";

// Number of ticks after which to capture a thumbnail image of the play space.
// 300 ticks equates to approximately 1-1.5 seconds in apps that become idle
// after the first few ticks, or 10-15 seconds in apps that draw constantly.
export const CAPTURE_TICK_COUNT = 300;
