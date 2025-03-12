# @code-dot-org/component-library

Common Styles (`variables`, `colors`, `mixins`, `typography styles`, etc) of Code.org Design System

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Development](#development)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Styling](#styling)
- [Testing](#testing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Contributing](#contributing)

## Updating FontAwesome Files

If you are looking to update the FontAwesome files in `font.scss`, you'll need to do the following:

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

At time of writing, these files were referenced in the following places:

**Hard coded strings**

- Applab Exporter: apps/src/applab/Exporter.js
- hourofcode.com: pegasus/sites.v3/hourofcode.com/styles/030-font-awesome-min.css
- shared: shared/css/font.scss (shared strings defined here)

**Usages of shared strings**

- pegasus: pegasus/sites.v3/code.org/public/css/font-awesome.min.scss
- dashboard: dashboard/app/stylesheets/application.scss

## Overview

• A brief, high-level introduction about the package or directory.
• What it does and why it exists.
• Any guiding principles (e.g., “follows design system guidelines”).

## Installation

• How to install the package or set up the environment.
• Any dependencies or peer dependencies.
• Examples:

## Development

To run the code in development mode (build + watch):

```bash
yarn run dev
```

## Usage

• Code examples for how to use the package or component.
• Cover common use cases and edge cases.
• Include Storybook links if available.

## API Reference

• List all available props, methods, and return values.
• Example format:

## Best Practices

• Tips and guidelines on how to use the component correctly.
• Performance considerations.
• Accessibility tips.

## Styling

• How the component is styled.
• How to override styles.
• How it works with primitiveColors.scss and colors.scss.

## Testing

• How to test the component.
• What kinds of tests are recommended.
• Example using Jest/RTL.

## Contributing

For information on how to contribute to this package, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

• How to contribute.
• Coding standards and pull request guidelines.
• How to add a new component.

## FAQ / Troubleshooting

• Common issues and solutions.

## Changelog

You can find the latest changelog in [CHANGELOG.md](CHANGELOG.md).

➡️ component-library-styles
• Focus on available variables (e.g., colors, spacing, typography).
• Include examples on how to extend and override styles.
• Document any theming support (e.g., light/dark mode).
