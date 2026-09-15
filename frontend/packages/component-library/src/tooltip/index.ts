// Import {Tooltip} from '@mui/material' and CdoTheme styles it. This is the one
// extra it ships.
export {keyboardOnlyTooltipProps} from './keyboardOnly';

// Legacy DSCO tooltip. Note `TooltipProps` still refers to it.
export type {TooltipProps, TooltipOverlayProps} from './_Tooltip';
export {default as LegacyTooltip, TooltipOverlay} from './_Tooltip';
export type {WithTooltipProps, WithTooltipHandle} from './WithTooltip';
export {default as WithTooltip} from './WithTooltip';
