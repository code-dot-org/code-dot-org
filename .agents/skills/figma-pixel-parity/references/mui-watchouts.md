# MUI watch-outs

Confirm a failure exists in the component before applying its fix.

## Specified geometry beats MUI defaults

MUI’s default size, padding, radius, typography, ripple, and text transform are not the design. When the recipe gives a value, the component sets that value. Ripple, shadow, and uppercase labels stay only when Figma shows them.

## Interactive color does not belong in inline `style`

MUI’s hover and active styles override inline `backgroundColor` and `color`. Set the color in the component’s `.module.scss`, where `:hover`, `:active`, and `:focus-visible` can replace it per state. For a value that varies per instance, prefer a modifier class. An inline custom property (`style={{'--x': value}}`) is the one allowed inline-style exception, only for such per-instance values and only when the stylesheet consumes it. Never put the color itself, or a hover or active value, in an inline `style`.

## Dev can look right when production is wrong

MUI injects Emotion styles with compound class selectors. A single CSS-module class can lose to those selectors, and the winner can change between a dev server and a production bundle because stylesheet order differs. If a color is correct locally and collapses to the body or theme default in the production build, the library style is losing the cascade. Raise specificity on that component’s own root selector, or move the color into a stylesheet that wins in both builds. Verify the production build, not only the dev server.

## State is not a prop

Figma’s `state` axis (default, hover, press, focus, disabled) describes CSS and interaction. Expose disabled, selected, and value props when the component actually has them. Do not add `state="hover"` so a screenshot is easier to take.

## Fonts before pixels

Load the font files the library ships, then capture. Comparing against Figma while a fallback font is showing produces fake size and weight bugs.
