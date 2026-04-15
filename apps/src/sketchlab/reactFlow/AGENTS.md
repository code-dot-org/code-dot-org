# React Flow based Sketch Lab
This folder contains a React Flow based implementation of Sketch Lab. Sketch Lab is an accessible
tool for making interactive diagrams, used by students in grades 6-12.

## Code Guidelines
- The lab must be accessible, following WCAG 2.1 AA guidelines. Specifically: all components must have intuitive
 labels for a screenreader and must be both click and keyboard interactable, images must have alt text or the 
 ability for a user to add alt text, pop up menus must have focus traps, and there must be a logical focus order.
- Utilize the code-dot-org component library when possible. The component library is located
  in [/frontend](/frontend/packages/component-library/). We are in the process of migrating 
  to MUI components. If a component is labeled as deprecated and there is a MUI component available
  in the storybook for the frontend, use the MUI component.
- The lab has both a dark and light theme, utilizing 
  [ThemeContext](/frontend/packages/component-library/src/common/contexts/ThemeContext.tsx).
  Any colors referenced should use themed colors from the [frontend](/frontend/packages/component-library-styles/colors.css).
  Ensure color contrast always passes WCAG 2.1 AA guidelines.
- We hard-code user-facing English strings. The old way of using i18n you see in other folders is deprecated.
- Use human-readable variable names. Prefer names such as `newWidth` over `newW`.
- Use constants for any magic numbers.
- Ensure eslint passes.
- Ensure prettier passes.
- CSS module names should be in kebab-case.