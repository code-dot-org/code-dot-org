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
- [Accessibility](#-accessibility)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Changelog](#changelog)

## Overview

Code.org Design System React component library.

Component-library provides a collection of reusable components, helpers, hooks, contexts, etc and guidelines to help
you build consistent and accessible user interfaces. It aims to improve the development process by offering a unified
design language and reducing the need for redundant code.

🔹 Why this package exists:

- Improve development speed by reducing the need to write custom components.
- Ensure consistent design across Code.org applications.
- Maintain accessible and user-friendly components.

🔹 Key Features:

- ✅ Built-in support for theming (light/dark mode) [Currently in progress, only part of the components are themed
  (those that use @code-dot-org/component-library-styles/colors.scss)]
- ✅ TypeScript support
- ✅ Accessibility-first design
- ✅ Well-documented with Storybook ([See Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook))

## Installation

Right now this package is only available in code-dot-org/code-dot-org repository via linking the package,
meaning you can't install it via npm or yarn. To use the component library in your project, you need to link the
package.

## Development

To run the code in development mode (build + watch):

```bash
yarn run dev
```

This mode also generates the TypeScript declaration files, which generally take upwards of 20 seconds but is necessary
for cross-project development. To skip TypeScript declaration generation (for example, when locally developing
components without the need to cross-reference):

```bash
yarn run dev:fast
```

## Usage

Here are some **basic** examples of how to use the component library in your project. Since these examples are basic,
they're not showing all the supported props.

For more examples, check the
[public Storybook documentation](https://code-dot-org.github.io/code-dot-org/component-library-storybook),
which contains usage examples for all components. You can also explore the component source code and related stories
directly.

### Example with `LinkButton`

Use `LinkButton` when you need a styled link button that supports navigation:

```jsx
import {LinkButton} from '@code-dot-org/component-library/button';

const App = () => (
  <div>
    {/* size="m" defines a medium-sized button */}
    <LinkButton href="/" size="m">
      Click Me
    </LinkButton>
  </div>
);

export default App;
```

### Example with `Button`

Use Button for general clickable actions:

```jsx
import {Button} from '@code-dot-org/component-library/button';

const Example = () => (
  <Button onClick={() => alert('Clicked!')}>Click Me</Button>
);
```

- `onClick` — Handles the button click event.
- Supports all common HTML button attributes.

### Example with `Alert`

Use Alert to display status messages or feedback to the user:

```jsx
import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import styles from './Example.module.scss'; // Custom styles for the alert

const Example = () => {
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  const closeAlert = () => {
    setIsAlertVisible(false);
  };

  return (
    isAlertVisible && (
      <Alert
        text="Some alert text"
        type={alertTypes.success} // Success styling
        className={styles.alert} // Custom class for additional styling
        onClose={closeAlert}
      />
    )
  );
};
```

- `type={alertTypes.success}` — Defines the style of the alert (success, error, warning, info).
- `onClose` — Callback to handle alert dismissal.
- `className={styles.alert}` — Custom styles from a module.scss file.

## API Reference

We use **TypeScript** to define the API of our components. This means that you can view the available props and their
types directly in your code editor.

### 📖 Where to Find Full API Docs:

You can also explore the complete API reference and usage examples in the
[public Storybook documentation](https://code-dot-org.github.io/code-dot-org/component-library-storybook).

### 🛠️ Example (from TypeScript Types)

Here’s an example of how the component API is defined using TypeScript:

```ts
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Alert text */
  text: string;
  /** Alert link */
  link?: LinkProps;
  /** Alert icon */
  icon?: FontAwesomeV6IconProps;
  /** Show icon */
  showIcon?: boolean;
  /** Alert `isImmediateImportance`. Used to toggle between role='alert' and role='status'
   * By default set to true, which means we'll render role='alert'
   *
   * For context - The `alert` role should only be used for information that requires the user's
   * immediate attention, for example:
   * - An invalid value was entered into a form field
   * - The user's login session is about to expire
   * - The connection to the server was lost so local changes will not be saved.
   *
   * `status` should be used for advisory information for the user that is not important enough to be an alert.
   * */
  isImmediateImportance?: boolean;
  /** Alert custom className */
  type?: AlertType;
  /** Alert on Close callback */
  onClose?: () => void;
  /** Alert close label */
  closeLabel?: string;
  /** Alert custom className */
  className?: string;
  /** Alert size */
  size?: ComponentSizeXSToL;
}
```

### 💡 Why TypeScript Matters:

- Ensures type safety at compile time
- ️Provides rich autocomplete in modern IDEs
- ️Reduces runtime errors by enforcing prop types

### 🔎 How to Explore More:

- Check the component’s source code for full implementation details.
- If you only have access to the package (dist) in node_modules, check the .d.ts files for detailed type definitions.
- Use Storybook to see examples with available props and behavior.
- Use TypeScript’s autocomplete to explore the component’s API directly in your editor.

## Best Practices

- Use Semantic Colors:

  - Use semantic colors from `@code-dot-org/component-library-styles/colors.scss` to maintain consistent theming
    across light and dark modes. This ensures visual consistency and makes it easier to update themes globally.

- Follow Existing Patterns, maintain consistency by following established patterns for:

  - Naming – Keep names descriptive and consistent with other components.
  - Structure – Organize files in the same way as other components in the library.
  - Testing – Follow existing test patterns using Jest, RTL and @testing-library/user-event..
  - Stories – Ensure the component has a Storybook entry with usage examples.
  - Styles – Use existing mixins and variables from primitiveColors.scss and colors.scss.

- Follow the Single Responsibility Principle:
  Each component should do one thing and do it well. This makes components easier to test, maintain, and reuse.

  - Good Example: A Button component handles only rendering and click events.
  - Bad Example: A Button component that also manages state or business logic.

- Extract Reusable Parts:
  If a part of a component is used more than once or could be used elsewhere, extract it into a separate component.
  This keeps components clean and reduces duplication.
  - Example: If you have a complex Tooltip inside a component and it’s used elsewhere, extract it into a Tooltip
    component.

## Styling

We use **SCSS modules** and **class names** for styling. This ensures that component styles are scoped and isolated,
which helps prevent unintended side effects.

### Overwriting Component Styles

Since SCSS modules generate locally scoped class names, to overwrite the styles of a component, you need to ensure that
the overriding styles have the highest specificity priority. Follow the cascade and specificity rules to make sures your
custom styles will be applied correctly (if hesitant - please read [MDN Specificity Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity),
[Importance of CSS Specificity and its best practices](https://blogs.halodoc.io/best-practices-that-we-follow-to-avoid-specificity-issues/)).

**_Always rely on css selector priority, not the order of stylesheets being loaded or classNames being applied._**.
(Since order of stylesheets load and or classNames being applied can be changed almost randomly [example here](https://codedotorg.slack.com/archives/C0T0PNTM3/p1710363328926969)).

**_NEVER RELY ON THE ORDER OF STYLESHEETS BEING LOADED AND/OR CLASSNAMES BEING APPLIED._**

#### ✅ Recommended Approaches: Using SCSS Modules

##### You can define custom styles in a SCSS module and apply them using a parent element or directly on the component.

**Example: Overwriting via parent element style**

```scss
// Example.module.scss
.parentDiv {
  h1 {
    color: #75de30;
  }
}
```

```jsx
import styles from './Example.module.scss';

const Example = () => (
  <div className={styles.parentDiv}>
    <Heading1 visualAppearance="heading-sm">Some Heading</Heading1>
  </div>
);
```

**Example: Overwriting via component-specific class**

```scss
// Example.module.scss
h1.customHeadingStyle {
  color: #b2ff39;
}
```

```jsx
import styles from './Example.module.scss';

const Example = () => (
  <Heading1 visualAppearance="heading-sm" className={styles.customHeadingStyle}>
    Some Heading
  </Heading1>
);
```

##### Use of CSS Variables for Theming

Theming should rely on semantic colors defined in primitiveColors.scss and colors.scss. This ensures consistent
color application across components and simplifies light/dark mode handling.
Example:

```scss
.customHeadingStyle {
  color: var(--text-neutral-primary);
}
```

#### ❌ Not Recommended Approaches:

##### Avoid Inline Styles

Inline styles are harder to override and don’t support media queries or pseudo-selectors.
Example (❌ not recommended):

```jsx
<Heading1 visualAppearance="heading-lg" style={{color: '#f00'}}>
  Some Heading
</Heading1>
```

##### Avoid Global Styles

Using global styles inside component styles can cause conflicts and unintended side effects.
Example (❌ not recommended):

```scss
h1 {
  color: #f00; // ❌ This might override other h1 elements unintentionally.
}
```

### Best Practices for Styling:

- Rely on SCSS modules for style isolation and specificity.
- Use semantic colors (`colors.scss`) from `@code-dot-org/component-library-styles` package to keep theming consistent.
- If it's impossible to use semantic colors, use primitive colors (`primitiveColors.scss`) from
  `@code-dot-org/component-library-styles` instead.
- Use other colors only when you can't use semantic or primitive colors.
- Prefer class-based styles over inline styles to maintain override flexibility.
- Follow the cascade and specificity rules (review [MDN Specificity Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity),
  [Importance of CSS Specificity and its best practices](https://blogs.halodoc.io/best-practices-that-we-follow-to-avoid-specificity-issues/)).
- For dark/light mode support, rely on `semantic colors`, `data-theme` attribute and avoid hard-coded colors.

## Testing

We use Jest, RTL and @testing-library/user-event for unit tests. Each component should have a corresponding test file that covers
all possible use cases and edge cases. Where RTL is not enough, we use
[Storybook Play Function](https://storybook.js.org/docs/writing-stories/play-function) for visual tests.
We follow [RTL testing approach](https://kentcdodds.com/blog/testing-implementation-details), testing components how
user see/interact with them instead of testing implementation details.
We also have eyes tests (in `@code-dot-org/design-system-storybook`) that are used for visual regression testing.
On top of that, we have linting rules to ensure code quality, of course.

You can run the tests using the following commands:

1. Run jest unit tests:

   ```bash
   yarn test
   ```

2. Run linting:

   ```bash
   yarn lint

   yarn lint:fix

   yarn prettier:fix
   ```

## 🧩 Accessibility

We follow WCAG guidelines to ensure our components are accessible.
Accessibility improves usability for all users, including those with disabilities.

Short accessibility Checklist:

- ✅ Full keyboard accessibility
- ✅ Sufficient color contrast ([APCA](http://www.myndex.com/APCA))
- ✅ Screen reader support
- ✅ RTL (right-to-left) languages support

Complete Accessibility Checklist is following:

- ✅ A keyboard user can access full functionality of a component (with props required/suggested as needed to make this
  happen)
- ✅ A mouse user can access full functionality of a component (with props required/suggested as needed to make this
  happen)
- ✅ A voiceover user can access full functionality of a component (with props required/suggested as needed to make this
  happen)\*\*
- ✅ We have sufficient color contrast according to
  the [Advanced Perceptual Contrast Algorithm](http://www.myndex.com/APCA) (APCA)
- ✅ Site renders and behaves as expected for an RTL user
- ✅ Styling accommodates differently-sized strings for non-English users

We also use [Storybook Accessibility Addon](https://storybook.js.org/docs/writing-tests/accessibility-testing) to test
components for most accessibility issues automatically on each build, but it's not a substitute for manual testing
as it can't check all the possible issues. Also, RTL testing is done manually.

## Contributing

For information on how to contribute to this package, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## FAQ / Troubleshooting

If you encounter any issue that is not addressed here - feel free to reach out to us via `#ask-design-system`
slack channel,
github issues or any other means of communication.

- **Why is my component not rendering correctly?**  
  Make sure that the component is correctly imported and that Storybook compiles without errors.

- **Can I request a new component or an update to existing one?**  
  Yes! Create a thread in `#ask-design-system` Slack channel or open a GitHub issue.

- **How do I add a new component and/or make an update to an existing component?**  
  Follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md).

- **How do I add custom styles to a component?**  
  Use SCSS modules and class names to ensure that styles are scoped and isolated. For more details
  see [Styling](#styling).

- **How do I test a component?**  
  Use Jest, RTL and @testing-library/user-event for unit tests. For more details see [Testing](#testing).

## Changelog

You can find the latest changelog in [CHANGELOG.md](CHANGELOG.md).

The changelog is updated with each release. Make sure to check it regularly to stay up to date!
