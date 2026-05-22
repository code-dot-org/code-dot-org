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
@use '@code-dot-org/component-library-styles/typography.module.scss' as
  typography;
```

For CSS variables (colors and fonts), import them globally in your application root:

```javascript
// In your main application entry point (e.g., __root.tsx or App.tsx)
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
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

Colors are defined as CSS variables in `colors.css` and `primitiveColors.css`. These files should be imported globally in your application root (see [Installation](#installation)). Once imported, you can use the CSS variables directly in your SCSS or CSS files:

```scss
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

The `colors.css` file defines semantic colors as CSS variables, which adapt to different themes (light and dark).
Semantic colors map to underlying **primitive colors** and are intended to remain consistent across the design system.
To view the latest color variables, refer to our [DSCO Variables Figma page](https://www.figma.com/design/NIVcvUgU3WmXpAmp9U2vVy/DSCO-Variables?node-id=2925-33933&m=dev).

**Important:** `colors.css` depends on `primitiveColors.css`, so make sure to import `primitiveColors.css` before `colors.css` in your application root.

#### ✅ Example:

First, import the CSS files globally in your application root:

```javascript
// In your main application entry point (e.g., __root.tsx or App.tsx)
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
```

Then use the CSS variables in your SCSS or CSS files:

```scss
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

You can use semantic colors directly in your SCSS or CSS files (after importing the CSS files globally):

```scss
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

The `primitiveColors.css` file defines the **base colors** as CSS variables used throughout the design system. Unlike semantic colors,
primitive colors are **fixed** and do **not change** across light and dark themes.

Primitive colors are meant to be used as the foundation for building semantic colors. They define a consistent color.
To view the latest primitive color variables, refer to our [DSCO Variables Figma page](https://www.figma.com/design/NIVcvUgU3WmXpAmp9U2vVy/DSCO-Variables?node-id=2925-10156&m=dev).
palette and ensure a unified visual language across all Code.org components.

**Important:** `primitiveColors.css` should be imported before `colors.css` in your application root, as semantic colors depend on primitive colors.

#### ✅ Example:

First, import the CSS file globally in your application root:

```javascript
// In your main application entry point (e.g., __root.tsx or App.tsx)
import '@code-dot-org/component-library-styles/primitiveColors.css';
```

Then use the CSS variables in your SCSS or CSS files:

```scss
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

The `font.scss` file provides SCSS mixins for fonts, while `fontVariables.css` defines CSS variables for font families and weights used throughout the Code.org design system.
We use a combination of **Figtree** and **Noto Sans** fonts to maintain a consistent look and feel across the platform.

**Important:** `fontVariables.css` should be imported globally in your application root to make font CSS variables available throughout your application.

We provide font definitions, weights, and mixins to simplify applying consistent font styles across components.
All fonts are available globally through CSS variables (defined in `fontVariables.css`) and SCSS mixins (defined in `font.scss`).

---

#### ✅ Example:

First, import the font CSS variables globally in your application root:

```javascript
// In your main application entry point (e.g., __root.tsx or App.tsx)
import '@code-dot-org/component-library-styles/fontVariables.css';
```

Then use font mixins in your SCSS files:

```scss
@use '@code-dot-org/component-library-styles/font.scss';

.myComponent {
  @include main-font-bold;
}
```

Or use CSS variables directly in your SCSS or CSS files:

```scss
.myComponent {
  font-family: var(--font-family-main);
  font-weight: var(--font-weight-bold);
}
```

Or in JSX/TSX inline styles:

```jsx
<div
  style={{
    fontFamily: 'var(--font-family-main)',
    fontWeight: 'var(--font-weight-bold)',
  }}
>
  Text content
</div>
```

---

#### ✅ Available Font CSS Variables

Font families and weights are available as CSS variables (defined in `fontVariables.css`):

| CSS Variable                                   | Description                              | Value                                                            |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `--font-family-main`                           | Combined main font (Figtree + Noto Sans) | `'Figtree', 'Noto Sans', 'Noto Sans Math', ..., sans-serif`      |
| `--font-family-barlow-semi-condensed-semibold` | Barlow Semi Condensed Semibold font      | `'Barlow Semi Condensed Semibold', 'Noto Sans', ..., sans-serif` |
| `--font-family-barlow-semi-condensed-medium`   | Barlow Semi Condensed Medium font        | `'Barlow Semi Condensed Medium', 'Noto Sans', ..., sans-serif`   |
| `--font-weight-thin`                           | Thin font weight                         | `100`                                                            |
| `--font-weight-extra-light`                    | Extra light font weight                  | `200`                                                            |
| `--font-weight-light`                          | Light font weight                        | `300`                                                            |
| `--font-weight-regular`                        | Regular font weight                      | `400`                                                            |
| `--font-weight-medium`                         | Medium font weight                       | `500`                                                            |
| `--font-weight-semi-bold`                      | Semi-bold font weight                    | `600`                                                            |
| `--font-weight-bold`                           | Bold font weight                         | `700`                                                            |
| `--font-weight-extra-bold`                     | Extra bold font weight                   | `800`                                                            |
| `--font-weight-black`                          | Black font weight                        | `900`                                                            |

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

- ✅ Import `fontVariables.css` globally in your application root to make font CSS variables available.
- ✅ Use `main-font` mixins (from `font.scss`) or CSS variables (from `fontVariables.css`) instead of direct font-family definitions.
- ✅ Use the provided CSS variables or mixins for font weights instead of hard-coded values.
- ✅ Figtree should be the primary font; Noto Sans is used for fallback and internationalization.
- ✅ CSS variables can be used in inline styles (JSX/TSX) when needed, but prefer SCSS mixins when possible.

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

- ✅ Use **semantic colors** from `colors.css`, unless it's necessary to use `primitiveColors.css`
  or any other colors.
- ✅ Import `primitiveColors.css` before `colors.css` in your application root to ensure proper variable resolution.
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
