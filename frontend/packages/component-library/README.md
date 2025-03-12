# @code-dot-org/component-library

Code.org Design System React component library.

Welcome to the Code.org Design System Component Library! This package contains the design system components used
across Code.org's frontend applications to ensure consistency and reusability of UI components.

## Table of Contents

- [Overview](#overview)
- [Installation[UPCOMING]](#installation)
- [Development](#development)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Styling](#styling)
- [Testing](#testing)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Changelog](#changelog)

## Overview

Code.org Design System React component library.

Component-library provides a collection of reusable components, styles, and guidelines to help you build
consistent and accessible user interfaces. It aims to improve the development process by offering a unified
design language and reducing the need for redundant code.

• A brief, high-level introduction about the package or directory.
• What it does and why it exists.
• Any guiding principles (e.g., “follows design system guidelines”).

## Installation

Right now this package is only available in code-dot-org/code-dot-org repository via linking the package.

• How to install the package or set up the environment.
• Any dependencies or peer dependencies.
• Examples:

## Development

To run the code in development mode (build + watch):

```bash
yarn run dev
```

This mode also generates the typescript declaration files, which generally take upwards of 20 seconds but is necessary
for cross-project development. To skip typescript declaration generation (for example, when locally developing
components without the need to cross-reference):

```bash
yarn run dev:fast
```

## Usage

To use the components from the component library in your project, import them as needed:

```jsx
import {LinkButton} from '@code-dot-org/component-library/Button';

const App = () => (
  <div>
    <LinkButton href="/" size="m">
      Click Me
    </LinkButton>
  </div>
);

export default App;
```

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

You can run the tests using the following commands:

1. Run jest unit tests:

   ```bash
   yarn test
   ```

2. Run linting:

   ```bash
   yarn lint
   ```

   • How to test the component.
   • What kinds of tests are recommended.
   • Example using Jest/RTL.

## Contributing

For information on how to contribute to this package, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## FAQ / Troubleshooting

If you encounter any issue that is not adressed here - feel free to reach out to us via #rebrand slack channel,
github issues or any other means of communication.
• Common issues and solutions.

## Changelog

You can find the latest changelog in [CHANGELOG.md](CHANGELOG.md).

➡️ component-library
• Focus on documenting the API and usage since this is where the components are defined.
• Include examples with Storybook links.
• Explain any design tokens, utility functions, and how they work together.
