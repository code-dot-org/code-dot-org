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

If you are looking to update the FontAwesome files in the `injectFontAwesome` function in `loader/index.ts`, you'll need to do the following steps.
If you want more information on how FontAwesome expects us to set things up, see the "Host Yourself - Webfonts" instructions** [here](https://fontawesome.com/docs/web/setup/host-yourself/webfonts), and supplement with the "Version 4 Compatibility" instructions listed there as well. [link](https://fontawesome.com/docs/web/setup/host-yourself/webfonts#version-4-compatibility)

1. **Download css and webfont files from FontAwesome.**
   Sign in with our shared dev account, find our "Code.org Kit" (as of May 2026 we are using the kit 'Code.org FontAwesome Kit v6 (Current)'), then click "Download Web Files" from the "Self-Host on the Web" option.
   This should produce a download of a superset of files you'll need to upload to S3 (we only use the css and webfont directories).
2. Once you've downloaded the kit, **look up the current unix timestamp and update relative paths for font files referenced in CSS to be absolute paths** to URLs where the font files will be located. You'll only need to upload the `css` and `webfonts` directories. You'll upload them to `cdo-dsco` bucket -- see an example of how updated CSS would look with absolute paths, and the folder structure in S3.

**Example CSS with absolute paths**

```
@font-face {
  font-family: "Font Awesome Kit";
  font-style: normal;
  font-display: block;
  src: url("https://dsco.code.org/assets/font-awesome-pro/1771519720295/webfonts/custom-icons.woff2") format("woff2");
}
```

**Example S3 folder structure (cdo-dsco/assets/font-awesome-pro/[unix timestamp], with css and webfonts directories)**

<img width="1674" height="408" alt="image" src="https://github.com/user-attachments/assets/da1ea1c6-18ac-4fc2-ba5c-c3be697f140a" />

4. If you're modifying custom fontawesome icons (i.e. 'kit' icons), make sure the list in `frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts` is up to date. The FontAwesome storybook `frontend/packages/component-library/src/fontAwesomeV6Icon/stories/FontAwesomeV6Icon.story.tsx` pulls from this list, so you
can verify the new icons appear correctly. If any are being removed, you might want to search the codebase for any usages of those icons to avoid regressions.
5. Update the URLs referencing the font files to use the new timestamped url. The files that must be updated are:
 - [frontend/packages/component-library-styles/font.scss](/frontend/packages/component-library-styles/font.scss)
 - [frontend/packages/fonts/src/loader/index.ts](/frontend/packages/fonts/src/loader/index.ts)
 - [shared/css/font.scss](/shared/css/font.scss)

If we end up changing the location of these files in S3 outside of the `cdo-dsco` bucket, we may need to update CORS settings. More documentation on those changes are in [this Slack thread](https://codedotorg.slack.com/archives/C03CK49G9/p1681500978173639).

As of April 2026, these files were referenced in the following places:

**Hard coded strings**

- Applab Exporter: apps/src/applab/Exporter.js

**Usages of shared strings**

- pegasus: `frontend/packages/fonts/src/loader/index.ts`
