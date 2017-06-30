# `styles_min/`

This folder contains CSS files that will be inlined into select pages (marked by `styles_min: true` in the page header), and bundled into the externally-loaded `style.css` file on all other pages. These styles were extracted from `styles/` because they are actively being used in at least one of the marked pages.

Keep the styles in this folder as small as possible, and only add stylesheets to this folder that will be actively used by a number of different pages.
