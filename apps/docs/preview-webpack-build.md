# Preview Webpack Build

This document explains the separate webpack build system for the Code Projects preview page (`preview.codeprojects.org`).

## Overview

The preview page requires a separate webpack build because it needs a slim, standalone JavaScript bundle that includes only React and the preview component, without the full Code.org application boilerplate.

## Why a Separate Build?

The main Code.org webpack configuration forces React and other dependencies into shared chunks (`vendors.js`, `code-studio-common.js`, etc.) that are loaded by the main application layout. However, the preview page:

1. **Doesn't use the main application layout** - It's a standalone HTML page
2. **Needs minimal dependencies** - Only React, ReactDOM, and the preview component
3. **Must be lightweight** - Should load quickly in an iframe

## Build Commands

### Development
```bash
# Build preview assets in development mode
yarn build:preview:dev

# Build both main apps and preview assets
yarn build:all
```

### Production
```bash
# Build preview assets in production mode (minified)
yarn build:preview:prod

# Build both main apps and preview assets for production
yarn build:dist && yarn build:preview:prod
```

### Integration with Main Build
The preview build is automatically integrated into the main Grunt build process:
- **`yarn build`** - Includes preview build via Grunt's `prebuild` task
- **`yarn build:dist`** - Includes preview build for production

## Build Output

The preview build generates:
- **`build/package/js/preview/preview.js`** - Development bundle
- **`build/package/js/preview/previewwp[hash].js`** - Production bundle (minified with content hash)
- **`build/package/js/preview/manifest.json`** - Asset manifest for Rails integration

## Rails Integration

The preview assets are integrated into the Rails asset pipeline via:
- **`lib/cdo/asset_helper.rb`** - Ruby helper methods for resolving preview assets
- **`dashboard/app/views/codeprojects_preview/show.html.haml`** - Template that loads the preview bundle

## Configuration Files

- **`webpack.preview.config.js`** - Separate webpack configuration for preview build
- **`apps/package.json`** - Build scripts for preview
- **`apps/Gruntfile.js`** - Integration with main build process

## Development Workflow

### For Preview Page Changes
1. Make changes to preview-related files
2. Run `yarn build:preview:dev` to rebuild preview assets
3. Refresh the preview page to see changes

### For Full Application Changes
1. Make changes to any apps code
2. Run `yarn build:all` to rebuild both main and preview assets
3. Restart dashboard server if needed

## Troubleshooting

### Preview Assets Not Loading
- Ensure `yarn build:preview` has been run
- Check that assets are copied to `build/package/js/preview/`
- Verify the HAML template is using `webpack_asset_path('preview/preview.js')`

### Build Errors
- Check that all required Babel plugins are installed
- Verify TypeScript configuration in `webpack.preview.config.js`
- Ensure all module aliases are correctly configured

### Integration Issues
- Make sure Grunt's `prebuild` task includes `exec:buildPreviewWebpack`
- Verify the preview build runs before the main webpack build
- Check that assets are properly copied to the final package directory

## Architecture Decision

This separate build approach was chosen over alternatives because:

1. **Maintains Original Component** - Keeps the existing `InnerHTMLPreview` component unchanged
2. **Minimal Dependencies** - Only includes what's actually needed
3. **Clear Separation** - Preview build is independent of main app complexity
4. **Production Ready** - Supports both development and production builds
5. **Integrated Workflow** - Works seamlessly with existing build processes

## Future Considerations

- Consider consolidating with main webpack config if preview page requirements grow
- Monitor bundle size to ensure it remains lightweight
- Evaluate if other standalone pages could benefit from similar treatment
