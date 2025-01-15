# @code-dot-org/component-library - Design System for Code.org

Welcome to the Code.org Design System Component Library! This repository contains the design system used across Code.org's frontend applications to ensure consistency and reusability of UI components.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Testing](#testing)

## Introduction

The component library provides a collection of reusable components, styles, and guidelines to help you build consistent and accessible user interfaces. It aims to improve the development process by offering a unified design language and reducing the need for redundant code.

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
