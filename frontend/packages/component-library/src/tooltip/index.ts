// The MUI-based tooltip. Use this one.
export type {CdoTooltipProps} from './Tooltip';
export {default as default, default as Tooltip} from './Tooltip';

// Legacy DSCO tooltip, kept for `WithTooltip` and for `TooltipOverlay`. Note
// that `TooltipProps` still refers to the legacy component, not to `Tooltip`.
export type {TooltipProps, TooltipOverlayProps} from './_Tooltip';
export {default as LegacyTooltip, TooltipOverlay} from './_Tooltip';
export type {WithTooltipProps, WithTooltipHandle} from './WithTooltip';
export {default as WithTooltip} from './WithTooltip';
