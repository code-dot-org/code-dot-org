# MUI watch-outs

This library is MUI-based, and its styling setup may differ from CADS. Confirm the failure exists here before applying a fix. Do not copy CADS selectors or class names across.

## Specified geometry beats MUI defaults

MUI’s default size, padding, radius, typography, ripple, and text transform are not the design. When the recipe gives a value, the component sets that value. Ripple, shadow, and uppercase labels stay only when Figma shows them.

## Interactive color does not belong in inline `style`

MUI’s hover and active styles override inline `backgroundColor` and `color`. Set custom properties on the element and consume them in the stylesheet, where `:hover`, `:active`, and `:focus-visible` can replace them per state.

## Dev can look right when production is wrong

MUI injects Emotion styles with compound class selectors. A single CSS-module class can lose to those selectors, and the winner can change between a dev server and a production bundle because stylesheet order differs. If a color is correct locally and collapses to the body or theme default in the production build, the library style is losing the cascade. Raise specificity on that component’s own root selector, or move the color into a stylesheet that wins in both builds. Verify the production build, not only the dev server.

## State is not a prop

Figma’s `state` axis (default, hover, press, focus, disabled) describes CSS and interaction. Expose disabled, selected, and value props when the component actually has them. Do not add `state="hover"` so a screenshot is easier to take.

## Fonts before pixels

Load the font files the library ships, then capture. Comparing against Figma while a fallback font is showing produces fake size and weight bugs.
