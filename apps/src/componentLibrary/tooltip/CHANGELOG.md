# Change Log

All notable changes to this project will be documented in this file.

## [0.2.2] ()

* updated `Tooltip` background color to be $light_gray_950;

## [0.2.1] (https://github.com/code-dot-org/code-dot-org/pull/59610)

* used DSCO Button component for `Tooltip` stories

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/59106)

* Reworked `WithTooltip` to use React Portal for rendering tooltip content outside the DOM hierarchy of the parent
  component. This allows the tooltip to be rendered outside the parent component's overflow boundaries.
* `WithTooltip` is now a recomended way to use `Tooltip` and `TooltipOverlay` components.

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/58273)

* Initial release