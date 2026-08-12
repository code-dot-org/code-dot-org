// Use this one.
export type {CdoTooltipProps} from './Tooltip';
export {default as default, default as Tooltip} from './Tooltip';

// Legacy DSCO tooltip. Note `TooltipProps` still refers to it, not to `Tooltip`.
export type {TooltipProps, TooltipOverlayProps} from './_Tooltip';
export {default as LegacyTooltip, TooltipOverlay} from './_Tooltip';
export type {WithTooltipProps, WithTooltipHandle} from './WithTooltip';
export {default as WithTooltip} from './WithTooltip';
