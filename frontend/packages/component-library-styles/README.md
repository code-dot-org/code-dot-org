# @code-dot-org/component-library-styles

Common Styles (`variables`, `colors`, `mixins`, `typography styles`, etc) of Code.org Design System

This package contains the shared styles used across the Code.org Design System. It includes CSS variables, SCSS mixins,
typography styles, and more to ensure visual consistency and a unified design language across all Code.org applications.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Development](#development)
- [Usage](#usage)
- [Available Variables](#available-variables)
  - [Colors](#colors)
  - [Primitive Colors](#primitive-colors)
  - [Fonts](#fonts)
  - [Font Awesome](#font-awesome)
  - [Typography](#typography)
  - [Variables](#variables)
  - [Mixins](#mixins)
- [Best Practices](#best-practices)
- [Theming](#theming)
- [Testing](#testing)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Changelog](#changelog)

## Overview

The `@code-dot-org/component-library-styles` package provides a unified styling foundation for Code.org's frontend components. It contains:

- **Semantic colors** – Ensures consistent theming and visual identity.
- **Primitive colors** – Provides a set of base fixed colors. (doesn't change with theme)
- **Fonts** – Provides font families definitions.
- **Font Awesome** – Provides Code.org Font Awesome kit icons.
- **Typography styles** – Provides standardized font sizes, line heights, and weights.
- **Variables** – Shared scss variables.
- **Mixins** – Common patterns and logic for consistent styling across components.

This package is meant to prevent style fragmentation, encourage consistency, and improve maintainability by centralizing all style definitions in one place.

## Installation

This package is currently available only within the Code.org monorepo. You cannot install it from npm or yarn.

To link the package in development:

```bash
yarn link @code-dot-org/component-library-styles
```

To use it in your project:

```scss
@use '@code-dot-org/component-library-styles/colors.scss';
@use '@code-dot-org/component-library-styles/typography.module.scss' as
  typography;
```

## Development

The easiest way to develop and see changes live quickly is to run `yarn dev` command from `/frontend` directory.
This will start the component-library and its Storybook and allow you to see changes in real-time.

```bash
#from /frontend directory
yarn dev
```

## Usage

You can import styles directly into your components:

### Example with Colors

```scss
@use '@code-dot-org/component-library-styles/colors.scss';

.myComponent {
  background-color: var(--background-neutral-primary);
  color: var(--text-neutral-primary);
}
```

### Example with Typography

```scss
@use '@code-dot-org/component-library-styles/typography.module.scss';

h1 {
  @include heading-lg;
}
```

## Available Variables

### Colors

The `colors.scss` file defines semantic colors, which adapt to different themes (light and dark).
Semantic colors map to underlying **primitive colors** and are intended to remain consistent across the design system.
To view the latest color variables, refer to our [DSCO Variables Figma page](https://www.figma.com/design/NIVcvUgU3WmXpAmp9U2vVy/DSCO-Variables?node-id=2925-33933&m=dev).

#### ✅ Example:

```scss
@use '@code-dot-org/component-library-styles/colors.scss';

.myComponent {
  background-color: var(--background-neutral-primary);
  color: var(--text-neutral-primary);
}
```

#### 🌞 Light Theme Semantic Colors

The light theme is defined using `:root` and `[data-theme="Light"]`.

##### **Example Colors**

| Variable                        | Description                 | Value                  |
| ------------------------------- | --------------------------- | ---------------------- |
| `--background-brand-aqua-light` | Light aqua background color | `var(--brand-aqua-10)` |
| `--borders-brand-aqua-primary`  | Primary aqua border color   | `var(--brand-aqua-50)` |
| `--text-brand-aqua-primary`     | Primary aqua text color     | `var(--brand-aqua-50)` |

#### 🌙 Dark Theme Semantic Colors

The dark theme is defined using `[data-theme="Dark"]`.

##### **Example Colors**

| Variable                        | Description                              | Value                         |
| ------------------------------- | ---------------------------------------- | ----------------------------- |
| `--background-brand-aqua-light` | Light aqua background color in dark mode | `var(--brand-aqua-90)`        |
| `--borders-brand-aqua-primary`  | Primary aqua border color in dark mode   | `var(--neutral-gray-50)`      |
| `--text-brand-aqua-primary`     | Primary aqua text color in dark mode     | `var(--text-neutral-primary)` |

---

#### ✅ Usage Example:

You can use semantic colors directly in your SCSS files:

```scss
@use '@code-dot-org/component-library-styles/colors.scss';

.myComponent {
  background-color: var(--background-neutral-primary);
  color: var(--text-neutral-primary);
  border: 1px solid var(--borders-neutral-primary);
}
```

---

#### ✅ Example with Dark Mode:

To enable dark mode, add a `data-theme="dark"` attribute to the root element:

```jsx
<div data-theme="dark">
  <MyComponent />
</div>
```

Example SCSS:

```scss
[data-theme='dark'] {
  .myComponent {
    background-color: var(--background-neutral-primary);
    color: var(--text-neutral-primary);
  }
}
```

---

#### 💡 Best Practices for Semantic Colors:

- ✅ Use **semantic colors** instead of primitive colors whenever possible.
- ✅ Keep theming consistent by relying on semantic tokens for dark/light mode handling.
- ✅ For custom styles, ensure semantic tokens are used instead of hard-coded values.

### Primitive Colors

The `primitiveColors.scss` file defines the **base colors** used throughout the design system. Unlike semantic colors,
primitive colors are **fixed** and do **not change** across light and dark themes.

Primitive colors are meant to be used as the foundation for building semantic colors. They define a consistent color.
To view the latest primitive color variables, refer to our [DSCO Variables Figma page](https://www.figma.com/design/NIVcvUgU3WmXpAmp9U2vVy/DSCO-Variables?node-id=2925-10156&m=dev).
palette and ensure a unified visual language across all Code.org components.

#### ✅ Example:

```scss
@use '@code-dot-org/component-library-styles/primitiveColors.scss';

.myComponent {
  background-color: var(--brand-aqua-50);
  color: var(--neutral-gray-90);
}
```

---

#### 🌈 Variables Examples

| Variable                  | Description         | Value     |
| ------------------------- | ------------------- | --------- |
| `--accent-orange-10`      | Lightest orange     | `#fff6e5` |
| `--accent-orange-100`     | Deepest orange      | `#5c3b00` |
| `--accent-strawberry-10`  | Lightest strawberry | `#ffe3e3` |
| `--accent-strawberry-100` | Deepest strawberry  | `#430d0d` |
| `--brand-aqua-10`         | Lightest aqua       | `#ebfffe` |
| `--brand-aqua-100`        | Deepest aqua        | `#005552` |
| `--brand-purple-5`        | Lightest purple     | `#f6edfd` |
| `--brand-purple-100`      | Deepest purple      | `#2f1c3e` |
| `--brand-teal-5`          | Lightest teal       | `#e0f8f9` |
| `--brand-teal-100`        | Deepest teal        | `#00383f` |

---

#### 💡 Best Practices for Primitive Colors:

- ✅ Use **semantic colors** whenever possible.
- ✅ Primitive colors should primarily be used for:
  - Defining semantic tokens
  - Internal design tokens
  - Styling that must remain constant regardless of theme
- ⛔️ Avoid directly referencing primitive colors for theming — use semantic tokens instead.

### Fonts

The `fonts.scss` file defines the fonts used throughout the Code.org design system.
We use a combination of **Figtree** and **Noto Sans** fonts to maintain a consistent look and feel across the platform.

We provide font definitions, weights, and mixins to simplify applying consistent font styles across components.
All fonts are available globally through CSS variables and SCSS mixins.

---

#### ✅ Example:

```scss
@use '@code-dot-org/component-library-styles/font.scss';

.myComponent {
  @include main-font-bold;
}
```

---

#### ✅ Available Fonts

| Variable           | Description                               | Value                                                    |
| ------------------ | ----------------------------------------- | -------------------------------------------------------- |
| `$figtree-font`    | Primary font for headings and body text   | `'Figtree'`                                              |
| `$noto-sans-fonts` | Fallback fonts for multi-language support | `'Noto Sans', 'Noto Sans Math', 'Noto Sans Arabic', ...` |
| `$main-font`       | Combined main font (Figtree + Noto Sans)  | `$figtree-font, $noto-sans-fonts, sans-serif`            |

---

#### ✅ Font Weights

| Variable                   | Description             | Value |
| -------------------------- | ----------------------- | ----- |
| `$thin-font-weight`        | Thin font weight        | `100` |
| `$extra-light-font-weight` | Extra light font weight | `200` |
| `$light-font-weight`       | Light font weight       | `300` |
| `$regular-font-weight`     | Regular font weight     | `400` |
| `$medium-font-weight`      | Medium font weight      | `500` |
| `$semi-bold-font-weight`   | Semi-bold font weight   | `600` |
| `$bold-font-weight`        | Bold font weight        | `700` |
| `$extra-bold-font-weight`  | Extra bold font weight  | `800` |
| `$black-font-weight`       | Black font weight       | `900` |

---

#### ✅ Font Mixins

| Mixin                          | Description             |
| ------------------------------ | ----------------------- |
| `main-font-thin`               | Thin font               |
| `main-font-thin-italic`        | Thin italic font        |
| `main-font-extra-light`        | Extra light font        |
| `main-font-extra-light-italic` | Extra light italic font |
| `main-font-light`              | Light font              |
| `main-font-light-italic`       | Light italic font       |
| `main-font-regular`            | Regular font            |
| `main-font-regular-italic`     | Regular italic font     |
| `main-font-medium`             | Medium font             |
| `main-font-medium-italic`      | Medium italic font      |
| `main-font-semi-bold`          | Semi-bold font          |
| `main-font-semi-bold-italic`   | Semi-bold italic font   |
| `main-font-bold`               | Bold font               |
| `main-font-bold-italic`        | Bold italic font        |
| `main-font-extra-bold`         | Extra-bold font         |
| `main-font-extra-bold-italic`  | Extra-bold italic font  |
| `main-font-black`              | Black font              |
| `main-font-black-italic`       | Black italic font       |

---

#### ✅ Example with Custom Font Styles:

You can override or extend font styles by combining mixins and custom properties:

```scss
.customHeader {
  @include main-font-semi-bold;
  font-size: 24px;
  color: var(--text-neutral-primary);
}
```

---

#### 💡 Best Practices for Fonts:

- ✅ Use `main-font` mixins instead of direct font-family definitions.
- ✅ Use the provided mixins for font weights instead of hard-coded values.
- ✅ Figtree should be the primary font; Noto Sans is used for fallback and internationalization.
- ⛔️ Avoid using inline styles for font definitions.

---

#### ✅ Font Awesome CDN URLS

We use **Font Awesome** for icons, loaded from the Code.org CDN.

| CDN URL                          | Description            |
| -------------------------------- | ---------------------- |
| `$font-awesome-core-url`         | Base Font Awesome file |
| `$font-awesome-brands-url`       | Brands icons file      |
| `$font-awesome-solid-url`        | Solid icons file       |
| `$font-awesome-regular-url`      | Regular icons file     |
| `$font-awesome-duotone-url`      | Duotone icons file     |
| `$font-awesome-custom-icons-url` | Custom icons file      |

---

#### ✅ Best Practices for Font Awesome:

- ⛔️ Avoid loading Font Awesome directly from npm to prevent conflicts with existing styles.

#### ✅ Example:

You can include Font Awesome icons in your component using the `fa` class:

```jsx
const Example = () => (
  <div>
    <i className={`fa fa-coffee`} />
  </div>
);
```

---

#### ✅ Font Awesome Icon Types

To see the full list of available Font Awesome icons, refer to the
[Font Awesome Icons Library](https://fontawesome.com/icons) and/or our own
[FontAwesomeV6Icon](./../component-library/src/fontAwesomeV6Icon/FontAwesomeV6Icon.tsx)

---

#### ✅ Example – Using Different Icon Types:

You can define icons directly in JSX:

```jsx
const Example = () => (
  <div>
    <i className="fa-solid fa-home"></i>
    <i className="fa-regular fa-user"></i>
    <i className="fa-regular fa-brands fa-github"></i>
  </div>
);
```

#### ✅ Best Practices for Font Awesome:

- ✅ Use the **CDN links** for faster loading and caching.
- ✅ Only load the necessary icon files to reduce bundle size.
- ✅ Use semantic CSS classes (`fa-solid`, `fa-regular`, `fa-brands`) for consistency.
- ✅ Keep the Font Awesome version aligned across all Code.org applications.
- ⛔️ Avoid importing Font Awesome files directly from npm to prevent conflicts.

---

#### ✅ Example with Custom Icons:

We support custom Font Awesome icons for Code.org:

```jsx
const Example = () => (
  <div>
    <i className="fa-kit fa-click-to-continue-up"></i>
  </div>
);
```

---

### Typography

The `typography.module.scss` file defines the typography styles used throughout the Code.org design system.
It includes mixins and utility classes for consistent heading, paragraph, and label styles. You can also find some
additional documentation in [typography.module.scss](./typography.module.scss) file itslef.

We use this file in [Typography components](./../component-library/src/typography/README.md) in
`@code-dot-org/component-library`. In most of the cases you should use Typography components instead of using this file
directly, but when it's not possible it's totally ok to use typography.module.scss directly.

All typography styles are created and updated by design team and based on a consistent scale and hierarchy to improve
readability and maintain a unified look and feel across components.

---

##### ✅ Example:

```scss
@use '@code-dot-org/component-library-styles/typography.module.scss';

h1 {
  @include heading-lg;
}
```

---

#### ✅ Heading Mixins

| Mixin         | Description               |
| ------------- | ------------------------- |
| `heading-xxl` | Extra extra large heading |
| `heading-xl`  | Extra large heading       |
| `heading-lg`  | Large heading             |
| `heading-md`  | Medium heading            |
| `heading-sm`  | Small heading             |
| `heading-xs`  | Extra small heading       |

---

#### ✅ Paragraph Mixins

| Mixin        | Description           |
| ------------ | --------------------- |
| `body-one`   | Large body text       |
| `body-two`   | Default body text     |
| `body-three` | Small body text       |
| `body-four`  | Extra small body text |

---

#### ✅ Overline Mixins

| Mixin            | Description             |
| ---------------- | ----------------------- |
| `overline-one`   | Large uppercase label   |
| `overline-two`   | Default uppercase label |
| `overline-three` | Small uppercase label   |

---

#### ✅ Additional Typography Mixins

| Mixin        | Description  |
| ------------ | ------------ |
| `strong`     | Bold text    |
| `em`         | Italic text  |
| `figcaption` | Caption text |

---

#### ✅ CSS Classes

We also provide utility classes that you can apply directly in the markup:

| Class             | Description               |
| ----------------- | ------------------------- |
| `.heading-xxl`    | Extra extra large heading |
| `.heading-xl`     | Extra large heading       |
| `.heading-lg`     | Large heading             |
| `.heading-md`     | Medium heading            |
| `.heading-sm`     | Small heading             |
| `.heading-xs`     | Extra small heading       |
| `.body-one`       | Large body text           |
| `.body-two`       | Default body text         |
| `.body-three`     | Small body text           |
| `.body-four`      | Extra small body text     |
| `.overline-one`   | Large uppercase label     |
| `.overline-two`   | Default uppercase label   |
| `.overline-three` | Small uppercase label     |
| `.strong`         | Bold text                 |
| `.emphasis`       | Italic text               |
| `.figcaption`     | Caption text              |

---

#### 💡 Best Practices for Typography:

- ✅ Use `heading` mixins for consistent heading styles.
- ✅ Use `body` mixins for consistent paragraph styles.
- ✅ Use `overline` mixins for uppercase labels.
- ✅ Use `em` and `strong` mixins for consistent emphasis and bold styling.
- ⛔️ Avoid defining font sizes manually – rely on mixins and classes.

### Variables

The `variables.scss` file defines the **shared design system variables** used across the Code.org frontend.
These variables cover consistent sizing, spacing, border radius, and other common design properties.

Variables in this file are intended to be used **consistently** across the design system components to ensure a
unified look and feel.

With time there'll be more variables added to this file, so make sure to check it out from time to time.

---

#### ✅ Example:

```scss
@use '@code-dot-org/component-library-styles/variables.scss';

.myComponent {
  width: $form-field-width;
  border-radius: $regular-border-radius;
}
```

---

#### ✅ Available Variables examples

| Variable                 | Description                          |
| ------------------------ | ------------------------------------ |
| `$form-field-width`      | Default width for form fields        |
| `$regular-border-radius` | Default border radius for components |

---

#### ✅ Best Practices for Variables:

- ✅ Use defined variables instead of hard-coded values to maintain consistency.
- ✅ Keep variable names descriptive and intuitive.
- ✅ Follow a consistent naming convention for new variables.
- ⛔️ Avoid redefining existing variables unless it's for a theme override.

---

#### ✅ Adding New Variables:

- New variables should be added to `variables.scss`.
- Follow the existing naming conventions.
- Consider the impact on light/dark mode or theming.

---

### Mixins

The `mixins.scss` file defines reusable patterns and logic to simplify consistent styling across Code.org components.

Mixins help avoid repetition and keep the SCSS code clean and organized.
They allow you to define a set of styles that can be reused throughout your project.

---

#### ✅ Usage example:

```scss
@use '@code-dot-org/component-library-styles/mixins.scss';

.myComponent {
  @include label-one;
}
```

---

#### ✅ Example mixins

| Mixin                          | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `label-two`                    | Label with size `0.875rem` and line-height `1.54`       |
| `link-body-two`                | Link body style with size `1rem` and line-height `1.48` |
| `button-two-text`              | Button text with size `1rem` and line-height `1.48`     |
| `field-helper-section-m`       | Medium field helper section                             |
| `field-helper-section-black`   | Black text color                                        |
| `field-error-section-black`    | Error color in black theme                              |
| `field-read-only-white-colors` | Read-only field style for white theme                   |
| `focus-styles`                 | Adds a `2px` solid teal border with offset              |
| `transition-all`               | Applies a `0.2s ease` transition to all properties      |

---

#### 💡 Best Practices for Mixins:

- ✅ Use mixins for reusable patterns instead of defining styles manually.
- ✅ Keep mixin names consistent and descriptive.
- ✅ Use parameterized mixins when possible to avoid duplication.

## Best Practices

- ✅ Use **semantic colors** from `colors.scss`, unless it's necessary to use `primitiveColors.scss`
  or any other colors.
- ✅ Keep typography and spacing consistent with design tokens.
- ⛔️ Avoid defining hard-coded colors — rely on CSS variables.

## Theming

We support dark and light mode using `data-theme` attributes.

✅ Example:

```jsx
<div data-theme="dark">
  <MyComponent />
</div>
```

✅ Example (via SCSS):

```scss
[data-theme='dark'] {
  .myComponent {
    background-color: var(--bg-primary-dark);
  }
}
```

We also have `ThemeContext`(see [ThemeProvider.tsx](./../component-library/src/common/contexts/ThemeContext.tsx)) in
`@code-dot-org/component-library` that can be used to switch themes in the app. It gives you the ability to switch
themes on the fly and access the current theme in your components.

## Testing

Run linting:

```bash
yarn lint

yarn lint:fix

yarn prettier:fix
```

## Contributing

For information on how to contribute to this package, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## FAQ / Troubleshooting

- **Why aren't my styles being applied?**
  Check for conflicting styles or CSS specificity issues. You may need to add additional selectors to the element you'd like to style.

## Changelog

You can find the latest changelog in [CHANGELOG.md](CHANGELOG.md).
