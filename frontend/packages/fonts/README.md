# @code-dot-org/fonts

This package contains the fonts used by Code.org.

## Table of Contents

- [Overview](#overview)
- [Updating FontAwesome Files](#updating-fontawesome-files)

## Font Awesome

The `loader/index.ts` file defines the CDN links and setup for **Font Awesome Pro** icons used across the Code.org
sites.  
We rely on the **Font Awesome Pro Kit** to provide a consistent set of icons that can be accessed globally via
CSS imports.

Once you connect font-awesome.scss to your project, you can use Font Awesome icons directly in your components by simply setting the needed classNames.

Font Awesome allows us to include a wide variety of icon types such as:

- **Solid** – Common action-based icons.
- **Brands** – Logos of major brands.
- **Regular** – Outlined icons.
- **Duotone** – Dual-color icons.
- **Custom Icons** – Custom icons specific to Code.org.

---

## Updating FontAwesome Files

If you are looking to update the FontAwesome files in the `injectFontAwesome` function in `loader/index.ts`, you'll need to do the following:

1. **Download css and webfont files from FontAwesome.**
   Sign in with our shared dev account, find our "Code.org Kit", then click "Download Web Files" from the "Self-Host on the Web" option.
   This should produce a download of a superset of files you'll need to upload to S3 (we only use the css and webfont directories).
2. **Use "Host Yourself - Webfonts" instructions** [here](https://fontawesome.com/docs/web/setup/host-yourself/webfonts).
   Supplement with the "Version 4 Compatibility" instructions listed there as well. [link](https://fontawesome.com/docs/web/setup/host-yourself/webfonts#version-4-compatibility)
3. Once you've downloaded the kit, **updated relative paths**
   for font files listed in CSS to be absolute paths to URLs storing font files, and uploaded them to a S3 bucket where we can access them.
   I've timestamped the folder location in S3 such that a developer can upload an updated set of files without affecting production.
4. **Updated CORS configuration on `cdo-dsco` bucket**
   to allow fetching of these files across code.org, studio.code.org, and hourofcode.com.
   More documentation on those changes are in [this Slack thread](https://codedotorg.slack.com/archives/C03CK49G9/p1681500978173639).
5. If you're modifying custom fontawesome icons (i.e. 'kit' icons), make sure the list in `frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts` is up to date as well as the FontAwesome storybook `frontend/packages/component-library/src/fontAwesomeV6Icon/stories/FontAwesomeV6Icon.story.tsx` If any are being removed, you might want to search the codebase for any usages of those icons to avoid regressions.

At time of writing, these files were referenced in the following places:

**Hard coded strings**

- Applab Exporter: apps/src/applab/Exporter.js
- hourofcode.com: pegasus/sites.v3/hourofcode.com/styles/030-font-awesome-min.css

**Usages of shared strings**

- pegasus: `frontend/packages/fonts/src/loader/index.ts`
